use std::{collections::HashMap, future::Future, io::stdin, process, str::FromStr, sync::OnceLock};

use keccak_const::Keccak256;

use alloy_eips::{BlockId, BlockNumberOrTag};
use alloy_network_primitives::BlockTransactionsKind;
use alloy_primitives::{
    address,
    map::{AddressHashMap, FbBuildHasher},
    Address, Bytes, FixedBytes, TxKind, U256,
};
use alloy_provider::{ext::DebugApi, Provider, RootProvider};
use alloy_rpc_types_eth::{
    state::AccountOverride, BlockOverrides, TransactionInput, TransactionRequest,
};
use alloy_rpc_types_trace::geth::{
    mux::MuxConfig,
    CallConfig, CallFrame, DiffMode, GethDebugBuiltInTracerType, GethDebugTracingCallOptions,
    GethDebugTracingOptions,
    GethTrace::{CallTracer, PreStateTracer},
    PreStateConfig, PreStateFrame,
};

use clap::Parser;

use url::Url;

use wasmtime::*;

use tokio::sync::Mutex;

use rand::Rng;

type Word = [u8; 32];

#[derive(Parser)]
#[command(version, about)]
struct Args {
    #[arg(
        short,
        long,
        default_value = "0x0000000000000000000000000000000000000001"
    )]
    sender: String,
    #[arg(short, long, default_value = "0")]
    block: u64,
    #[arg(
        short,
        long,
        default_value = "0x0000000000000000000000000000000000000002"
    )]
    addr: String,
    #[arg(short, long, default_value = "https://rpc.superposition.so")]
    url: String,
    #[arg(long, default_value = "user_entrypoint")]
    function_name: String,
    #[arg(long)]
    should_state_override: bool,
    #[arg(short, long)]
    verbose: bool,
    #[arg(short, long, default_value = "1")]
    invocation_count: usize,

    #[arg(required = true)]
    file: String,

    #[arg(required = true)]
    calldata: String,
}

#[tokio::main]
async fn main() -> Result<(), Error> {
    let args = Args::parse();

    static SENDER: OnceLock<Address> = OnceLock::new();
    static BLOCK: OnceLock<u64> = OnceLock::new();
    static ADDR: OnceLock<Address> = OnceLock::new();
    static TIMESTAMP: OnceLock<i64> = OnceLock::new();
    static VERBOSE: OnceLock<bool> = OnceLock::new();

    SENDER
        .set(Address::from_str(&args.sender).unwrap())
        .unwrap();
    BLOCK.set(args.block).unwrap();

    static PROVIDER: OnceLock<Mutex<RootProvider<alloy_transport_http::Http<reqwest::Client>>>> =
        OnceLock::new();
    PROVIDER
        .set(Mutex::new(RootProvider::new_http(
            Url::parse(&args.url).unwrap(),
        )))
        .unwrap();

    static CHAINID: OnceLock<i64> = OnceLock::new();

    ADDR.set(Address::from_str(&args.addr).unwrap()).unwrap();

    VERBOSE.set(args.verbose).unwrap();

    {
        let provider = PROVIDER.get().unwrap().lock().await;
        CHAINID
            .set(provider.get_chain_id().await.unwrap().try_into().unwrap())
            .unwrap();
        TIMESTAMP
            .set(
                u64::from_be_bytes(
                    provider
                        .get_block_by_number(
                            BlockNumberOrTag::Number(args.block),
                            BlockTransactionsKind::Hashes,
                        )
                        .await
                        .unwrap()
                        .unwrap()
                        .header
                        .timestamp
                        .to_be_bytes(),
                )
                .try_into()
                .unwrap(),
            )
            .unwrap();
    }

    // We always set the calldata here, though we won't use it since
    // presumably the application won't read from it if we run the tests
    // in the test running mode.

    let calldata = const_hex::decode(args.calldata).unwrap();
    let calldata_len = calldata.len();

    let engine = Engine::new(Config::new().wasm_backtrace(true).async_support(true)).unwrap();

    let module = Module::from_file(&engine, args.file.clone()).unwrap();

    let mut store: Store<()> = Store::new(&engine, ());
    let mut linker = Linker::new(&engine);

    // Storage written is used to store the storage that we've committed to storage, or
    // storage used by other contracts. The 0 word is used by our contract.
    static STORAGE_WRITTEN: OnceLock<Mutex<HashMap<Word, Word>>> = OnceLock::new();
    STORAGE_WRITTEN.set(Mutex::new(HashMap::new())).unwrap();

    static LAST_CALL_CALLDATA: OnceLock<Mutex<Option<Bytes>>> = OnceLock::new();
    LAST_CALL_CALLDATA.set(Mutex::new(None)).unwrap();

    let mut rng = rand::rng();

    let Args {
        should_state_override,
        invocation_count,
        ..
    } = args;

    let default_state: AddressHashMap<HashMap<FixedBytes<32>, String>> = if should_state_override {
        serde_json::from_reader(stdin()).unwrap()
    } else {
        AddressHashMap::with_hasher(FbBuildHasher::default())
    };

    // State overrides set by calls, on a per contract address basis.
    static STATE_OVERRIDES: OnceLock<Mutex<AddressHashMap<AccountOverride>>> = OnceLock::new();
    STATE_OVERRIDES
        .set(Mutex::new(HashMap::with_hasher(FbBuildHasher::default())))
        .unwrap();

    linker.func_wrap(
        "vm_hooks",
        "emit_log",
        |_caller: Caller<_>, _data_ptr: i32, _len: i32, _topics: i32| {
            // Access the pointer, read the relevant words, then print it (in the
            // future with the designated logging handler)!
        },
    )?;
    linker.func_wrap("vm_hooks", "msg_reentrant", |_: Caller<_>| -> i32 { 0 })?;
    linker.func_wrap(
        "vm_hooks",
        "read_args",
        move |mut caller: Caller<_>, pointer: i32| {
            // Have the length of the calldata prepared already, and write it to the
            // pointer they gave us.
            let mem = caller.get_export("memory").unwrap().into_memory().unwrap();
            mem.write(&mut caller, pointer as usize, &calldata).unwrap();
        },
    )?;
    linker.func_wrap(
        "vm_hooks",
        "storage_flush_cache",
        |_: Caller<_>, _clear: i32| {
            // Copy the content from the cached hashmap to the storage hashmap.
        },
    )?;
    linker.func_wrap(
        "vm_hooks",
        "write_result",
        move |mut caller: Caller<_>, pointer: i32, len: i32| {
            // Copy the length of the data to the return data buffer, then we can do
            // something with it. This is called at the end of the program, when
            // it's done doing it's thing.
            let mem = caller.get_export("memory").unwrap().into_memory().unwrap();
            let mut arr = Vec::with_capacity(len as usize);
            unsafe {
                std::ptr::copy(
                    mem.data_ptr(&mut caller).offset(pointer as isize),
                    arr.as_mut_ptr(),
                    len as usize,
                );
                arr.set_len(len as usize);
            }
            let h = const_hex::encode(&arr);
            println!("0x{h}");
            if *VERBOSE.get().unwrap() {
                eprintln!("0x{h}");
            }
        },
    )?;
    linker.func_wrap(
        "vm_hooks",
        "native_keccak256",
        |mut caller: Caller<_>, bytes_ptr: i32, len: i32, output_ptr: i32| {
            // Use const_keccak for whatever we have, and return it.
            let mem = caller.get_export("memory").unwrap().into_memory().unwrap();
            let mut arr = Vec::with_capacity(len as usize);
            unsafe {
                std::ptr::copy(
                    mem.data_ptr(&mut caller).offset(bytes_ptr as isize),
                    arr.as_mut_ptr(),
                    len as usize,
                );
                arr.set_len(len as usize);
            }
            mem.write(
                &mut caller,
                output_ptr as usize,
                &Keccak256::new().update(&arr).finalize(),
            )
            .unwrap();
        },
    )?;
    linker.func_wrap_async(
        "vm_hooks",
        "create1",
        |mut caller: Caller<_>,
         (code_ptr, code_len, endowment, contract_ptr, revert_data_len): (
            i32,
            i32,
            i32,
            i32,
            i32,
        )|
         -> Box<dyn Future<Output = ()> + Send> {
            Box::new(async move {
                // Simulate a creation by simulating the deployment of the contract using
                // a prestate tracer, then remembering the runtime code at the post state
                // address the same way we remember other state changes. Set the account
                // override for the address that we deployed at, and ensure that we update
                // the caller's nonce.
                let mem = caller.get_export("memory").unwrap().into_memory().unwrap();
                let mut code = Vec::with_capacity(code_len as usize);
                unsafe {
                    std::ptr::copy(
                        mem.data_ptr(&mut caller).offset(code_ptr as isize),
                        code.as_mut_ptr(),
                        code_len as usize,
                    );
                    code.set_len(code_len as usize);
                }
                let trace = PROVIDER
                    .get()
                    .unwrap()
                    .lock()
                    .await
                    .debug_trace_call(
                        {
                            let mut t = TransactionRequest::default();
                            t.from = Some(*ADDR.get().unwrap());
                            t.to = Some(TxKind::Create);
                            t.input = TransactionInput {
                                input: Some(Bytes::copy_from_slice(&code)),
                                data: None,
                            };
                            // We don't use any payable constructors, so we're commenting this out.
                            /* if endowment > 0 {
                                t.value = Some(U256::from(endowment));
                            } */
                            t
                        },
                        BlockId::Number(BlockNumberOrTag::Number(*BLOCK.get().unwrap())),
                        GethDebugTracingCallOptions {
                            tracing_options: GethDebugTracingOptions::mux_tracer({
                                let mut h = MuxConfig::default();
                                h.0.insert(
                                    GethDebugBuiltInTracerType::CallTracer,
                                    Some(
                                        CallConfig {
                                            only_top_call: Some(true),
                                            with_log: Some(false),
                                        }
                                        .into(),
                                    ),
                                );
                                h.0.insert(
                                    GethDebugBuiltInTracerType::PreStateTracer,
                                    Some(
                                        PreStateConfig {
                                            diff_mode: Some(true),
                                            disable_code: Some(true),
                                            disable_storage: None,
                                        }
                                        .into(),
                                    ),
                                );
                                h
                            }),
                            block_overrides: Some({
                                let mut b = BlockOverrides::default();
                                b.time = Some(*TIMESTAMP.get().unwrap() as u64);
                                b
                            }),
                            state_overrides: Some({
                                // We might not exist, so we need to set the balance to the max here for the
                                // contract in our overrides.
                                let mut s = STATE_OVERRIDES.get().unwrap().lock().await.clone();
                                s.entry(*ADDR.get().unwrap())
                                    .or_insert_with(AccountOverride::default)
                                    .balance = Some(U256::MAX);
                                s
                            }),
                        },
                    )
                    .await;
                let trace = trace.unwrap().try_into_mux_frame().unwrap();
                match trace
                    .0
                    .get(&GethDebugBuiltInTracerType::PreStateTracer)
                    .unwrap()
                {
                    PreStateTracer(PreStateFrame::Diff(DiffMode { post, .. })) => {
                        let mut state_overrides = STATE_OVERRIDES.get().unwrap().lock().await;
                        for (addr, state) in post {
                            if *addr == address!("A4b05FffffFffFFFFfFFfffFfffFFfffFfFfFFFf") {
                                eprintln!("refusing to set to arbos with a state override");
                                continue;
                            }
                            // It's not clear to me whether this is needed, but we're explicitly
                            // merging this anyway.
                            let o = state_overrides
                                .entry(*addr)
                                .or_insert_with(AccountOverride::default);
                            o.balance = state.balance;
                            o.nonce = state.nonce;
                            o.code = state.code.clone();
                            let storage = state.storage.iter();
                            match &mut o.state {
                                Some(state) => state.extend(storage),
                                None => {
                                    let mut h = HashMap::with_hasher(FbBuildHasher::default());
                                    h.extend(storage);
                                    o.state = Some(h)
                                }
                            }
                        }
                    }
                    a => panic!("not diff prestate tracer in mux: {a:?}"),
                };
                let (contract, output, status) = match trace
                    .0
                    .get(&GethDebugBuiltInTracerType::CallTracer)
                    .unwrap()
                {
                    CallTracer(CallFrame {
                        to, output, error, ..
                    }) => (
                        to,
                        output,
                        match error {
                            None => 0,
                            Some(_) => 1,
                        },
                    ),
                    a => panic!("not calltracer in mux: {a:?}"),
                };
                if status == 0 {
                    if *VERBOSE.get().unwrap() {
                        eprintln!(
                            "success deploying {} to {}",
                            const_hex::encode(&code),
                            contract.unwrap()
                        );
                    }
                    if let Some(c) = contract.clone() {
                        unsafe {
                            std::ptr::copy(
                                c.as_ptr(),
                                mem.data_ptr(&mut caller).offset(contract_ptr as isize),
                                20,
                            )
                        }
                    }
                } else {
                    if *VERBOSE.get().unwrap() {
                        eprintln!("fail deploying {}", const_hex::encode(code));
                    }
                    // Since we reverted, we need to set the revert_data variable!
                    if let Some(d) = output {
                        if *VERBOSE.get().unwrap() {
                            eprintln!("revert message for deploy: {d}");
                        }
                        unsafe {
                            std::ptr::copy(
                                d.len().to_be_bytes().as_ptr(),
                                mem.data_ptr(&mut caller).offset(revert_data_len as isize),
                                d.len(),
                            )
                        }
                    }
                    *LAST_CALL_CALLDATA.get().unwrap().lock().await = output.clone()
                }
            })
        },
    )?;
    linker.func_wrap_async(
        "vm_hooks",
        "create2",
        |mut caller: Caller<_>,
         (code_ptr, code_len, endowment, _salt, contract_ptr, revert_data_len): (i32, i32, i32, i32, i32, i32)| {
            // We have the same implementation as the create1 here, but without any work involving the salt.
            Box::new(async move {
                let mem = caller.get_export("memory").unwrap().into_memory().unwrap();
                let mut code = Vec::with_capacity(code_len as usize);
                unsafe {
                    std::ptr::copy(
                        mem.data_ptr(&mut caller).offset(code_ptr as isize),
                        code.as_mut_ptr(),
                        code_len as usize,
                    );
                    code.set_len(code_len as usize);
                }
                let trace = PROVIDER
                    .get()
                    .unwrap()
                    .lock()
                    .await
                    .debug_trace_call(
                        {
                            let mut t = TransactionRequest::default();
                            t.from = Some(*ADDR.get().unwrap());
                            t.to = Some(TxKind::Create);
                            t.input = TransactionInput {
                                input: Some(Bytes::copy_from_slice(&code)),
                                data: None,
                            };
                            t
                        },
                        BlockId::Number(BlockNumberOrTag::Number(*BLOCK.get().unwrap())),
                        GethDebugTracingCallOptions {
                            tracing_options: GethDebugTracingOptions::mux_tracer({
                                let mut h = MuxConfig::default();
                                h.0.insert(
                                    GethDebugBuiltInTracerType::CallTracer,
                                    Some(
                                        CallConfig {
                                            only_top_call: Some(true),
                                            with_log: Some(false),
                                        }
                                        .into(),
                                    ),
                                );
                                h.0.insert(
                                    GethDebugBuiltInTracerType::PreStateTracer,
                                    Some(
                                        PreStateConfig {
                                            diff_mode: Some(true),
                                            disable_code: Some(true),
                                            disable_storage: None,
                                        }
                                        .into(),
                                    ),
                                );
                                h
                            }),
                            block_overrides: Some({
                                let mut b = BlockOverrides::default();
                                b.time = Some(*TIMESTAMP.get().unwrap() as u64);
                                b
                            }),
                            state_overrides: Some({
                                // We might not exist, so we need to set the balance to the max here for the
                                // contract in our overrides.
                                let mut s = STATE_OVERRIDES.get().unwrap().lock().await.clone();
                                s.entry(*ADDR.get().unwrap())
                                    .or_insert_with(AccountOverride::default)
                                    .balance = Some(U256::MAX);
                                s
                            }),
                        },
                    )
                    .await;
                let trace = trace.unwrap().try_into_mux_frame().unwrap();
                match trace
                    .0
                    .get(&GethDebugBuiltInTracerType::PreStateTracer)
                    .unwrap()
                {
                    PreStateTracer(PreStateFrame::Diff(DiffMode { post, .. })) => {
                        let mut state_overrides = STATE_OVERRIDES.get().unwrap().lock().await;
                        for (addr, state) in post {
                            if *addr == address!("A4b05FffffFffFFFFfFFfffFfffFFfffFfFfFFFf") {
                                eprintln!("refusing to set to arbos with a state override");
                                continue;
                            }
                            // It's not clear to me whether this is needed, but we're explicitly
                            // merging this anyway.
                            let o = state_overrides
                                .entry(*addr)
                                .or_insert_with(AccountOverride::default);
                            o.balance = state.balance;
                            o.nonce = state.nonce;
                            o.code = state.code.clone();
                            let storage = state.storage.iter();
                            match &mut o.state {
                                Some(state) => state.extend(storage),
                                None => {
                                    let mut h = HashMap::with_hasher(FbBuildHasher::default());
                                    h.extend(storage);
                                    o.state = Some(h)
                                }
                            }
                        }
                    }
                    a => panic!("not diff prestate tracer in mux: {a:?}"),
                };
                let (contract, output, status) = match trace
                    .0
                    .get(&GethDebugBuiltInTracerType::CallTracer)
                    .unwrap()
                {
                    CallTracer(CallFrame {
                        to, output, error, ..
                    }) => (
                        to,
                        output,
                        match error {
                            None => 0,
                            Some(_) => 1,
                        },
                    ),
                    a => panic!("not calltracer in mux: {a:?}"),
                };
                if status == 0 {
                    if *VERBOSE.get().unwrap() {
                        eprintln!(
                            "success deploying {} to {}",
                            const_hex::encode(&code),
                            contract.unwrap()
                        );
                    }
                    if let Some(c) = contract.clone() {
                        unsafe {
                            std::ptr::copy(
                                c.as_ptr(),
                                mem.data_ptr(&mut caller).offset(contract_ptr as isize),
                                20,
                            )
                        }
                    }
                } else {
                    if *VERBOSE.get().unwrap() {
                        eprintln!("fail deploying {}", const_hex::encode(code));
                    }
                    // Since we reverted, we need to set the revert_data variable!
                    if let Some(d) = output {
                        if *VERBOSE.get().unwrap() {
                            eprintln!("revert message for deploy: {d}");
                        }
                        unsafe {
                            std::ptr::copy(
                                d.len().to_be_bytes().as_ptr(),
                                mem.data_ptr(&mut caller).offset(revert_data_len as isize),
                                d.len(),
                            )
                        }
                    }
                    // TODO: should we set this consistently to the return value from the call?
                    *LAST_CALL_CALLDATA.get().unwrap().lock().await = output.clone()
                }
            })
        },
    )?;
    linker.func_wrap_async(
        "vm_hooks",
        "storage_load_bytes32",
        move |mut caller: Caller<_>,
              (key_ptr, dest_ptr): (i32, i32)|
              -> Box<dyn Future<Output = ()> + Send> {
            Box::new(async move {
                // Consult the hashmap that we have for our storage, and if it doesn't exist
                // there, then use the RPC to load it, store it, then return it to the user here.
                let mut word: [u8; 32] = [0_u8; 32];
                let mem = caller.get_export("memory").unwrap().into_memory().unwrap();
                unsafe {
                    std::ptr::copy(
                        mem.data_ptr(&mut caller).offset(key_ptr as isize),
                        word.as_mut_ptr(),
                        32,
                    );
                }
                let mut storage_written = STORAGE_WRITTEN.get().unwrap().lock().await;
                let v = if let Some(v) = storage_written.get(&word) {
                    *v
                } else {
                    dbg!("LOOKING UP PROVIDER INFO");
                    let v = PROVIDER
                        .get()
                        .unwrap()
                        .lock()
                        .await
                        .get_storage_at(*ADDR.get().unwrap(), U256::from_be_bytes(word))
                        .number(*BLOCK.get().unwrap())
                        .await
                        .unwrap()
                        .to_be_bytes();
                    storage_written.insert(word, v);
                    v
                };
                unsafe {
                    std::ptr::copy(
                        v.as_ptr(),
                        mem.data_ptr(&mut caller).offset(dest_ptr as isize),
                        32,
                    );
                }
                if *VERBOSE.get().unwrap() {
                    eprintln!(
                        "word: {}: {}",
                        const_hex::encode(word),
                        const_hex::encode(v)
                    );
                }
            })
        },
    )?;
    linker.func_wrap("vm_hooks", "chainid", |_: Caller<_>| -> i64 {
        *CHAINID.get().unwrap()
    })?;
    linker.func_wrap("vm_hooks", "msg_value", |_: Caller<_>, _: i32| {})?;
    linker.func_wrap_async(
        "vm_hooks",
        "call_contract",
        move |mut caller: Caller<_>,
              (contract_ptr, calldata_ptr, calldata_len, value_ptr, gas, return_data_len_ptr): (
            i32,
            i32,
            i32,
            i32,
            i64,
            i32,
        )|
              -> Box<dyn Future<Output = i32> + Send> {
            Box::new(async move {
                // Use the eth_debugcall function with the rpc to simulate the experience of
                // calling a contract that's presumably deployed there. Look at the storage slots
                // that were used in the operation, and write every SSTORE and result of
                // SLOAD that's used to our storage hashmap for the contract's address.
                // Then do a merge to know what the current state is.
                let mem = caller.get_export("memory").unwrap().into_memory().unwrap();
                let mut contract = [0_u8; 20];
                let mut calldata = Vec::with_capacity(calldata_len as usize);
                let mut value = [0_u8; 32];
                unsafe {
                    std::ptr::copy(
                        mem.data_ptr(&mut caller).offset(contract_ptr as isize),
                        contract.as_mut_ptr(),
                        contract.len(),
                    );
                    std::ptr::copy(
                        mem.data_ptr(&mut caller).offset(calldata_ptr as isize),
                        calldata.as_mut_ptr(),
                        calldata_len as usize,
                    );
                    calldata.set_len(calldata_len as usize);
                    std::ptr::copy(
                        mem.data_ptr(&mut caller).offset(value_ptr as isize),
                        value.as_mut_ptr(),
                        value.len(),
                    );
                }
                let contract = Address::from(contract);
                // Below, we're using debug_tracecall for this. It would
                // be preferable to use eth_simulate now.
                let trace = PROVIDER
                    .get()
                    .unwrap()
                    .lock()
                    .await
                    .debug_trace_call(
                        {
                            let mut t = TransactionRequest::default();
                            t.from = Some(*ADDR.get().unwrap());
                            t.to = Some(TxKind::Call(contract));
                            t.input = TransactionInput {
                                input: Some(Bytes::copy_from_slice(&calldata)),
                                data: None,
                            };
                            t.gas = if gas > 0 {
                                Some(gas.try_into().unwrap())
                            } else {
                                None
                            };
                            t.value = Some(U256::from_be_bytes(value));
                            t
                        },
                        BlockId::Number(BlockNumberOrTag::Number(*BLOCK.get().unwrap())),
                        GethDebugTracingCallOptions {
                            tracing_options: GethDebugTracingOptions::mux_tracer({
                                let mut h = MuxConfig::default();
                                h.0.insert(
                                    GethDebugBuiltInTracerType::CallTracer,
                                    Some(
                                        CallConfig {
                                            only_top_call: Some(true),
                                            with_log: Some(false),
                                        }
                                        .into(),
                                    ),
                                );
                                h.0.insert(
                                    GethDebugBuiltInTracerType::PreStateTracer,
                                    Some(
                                        PreStateConfig {
                                            diff_mode: Some(true),
                                            disable_code: Some(true),
                                            disable_storage: None,
                                        }
                                        .into(),
                                    ),
                                );
                                h
                            }),
                            block_overrides: Some({
                                let mut b = BlockOverrides::default();
                                b.time = Some(*TIMESTAMP.get().unwrap() as u64);
                                b
                            }),
                            state_overrides: Some(
                                STATE_OVERRIDES.get().unwrap().lock().await.clone(),
                            ),
                        },
                    )
                    .await;
                let trace = trace.unwrap().try_into_mux_frame().unwrap();
                match trace
                    .0
                    .get(&GethDebugBuiltInTracerType::PreStateTracer)
                    .unwrap()
                {
                    PreStateTracer(PreStateFrame::Diff(DiffMode { post, .. })) => {
                        let mut state_overrides = STATE_OVERRIDES.get().unwrap().lock().await;
                        for (addr, state) in post {
                            if *addr == address!("A4b05FffffFffFFFFfFFfffFfffFFfffFfFfFFFf") {
                                eprintln!("refusing to set to arbos with a state override");
                                continue;
                            }
                            // It's not clear to me whether this is needed, but we're explicitly
                            // merging this anyway.
                            let o = state_overrides
                                .entry(*addr)
                                .or_insert_with(AccountOverride::default);
                            o.balance = state.balance;
                            o.nonce = state.nonce;
                            o.code = state.code.clone();
                            let storage = state.storage.iter();
                            match &mut o.state {
                                Some(state) => state.extend(storage),
                                None => {
                                    let mut h = HashMap::with_hasher(FbBuildHasher::default());
                                    h.extend(storage);
                                    o.state = Some(h)
                                }
                            }
                        }
                    }
                    a => panic!("not diff prestate tracer in mux: {a:?}"),
                };
                let (d, status) = match trace
                    .0
                    .get(&GethDebugBuiltInTracerType::CallTracer)
                    .unwrap()
                {
                    CallTracer(CallFrame { output, error, .. }) => (
                        output,
                        match error {
                            None => 0,
                            Some(_) => 1,
                        },
                    ),
                    a => panic!("not calltracer in mux: {a:?}"),
                };
                if let Some(d) = d.clone() {
                    unsafe {
                        std::ptr::copy(
                            d.len().to_le_bytes().as_ptr(),
                            mem.data_ptr(&mut caller)
                                .offset(return_data_len_ptr as isize),
                            std::mem::size_of::<u64>(),
                        )
                    }
                }
                let block = *BLOCK.get().unwrap();
                if *VERBOSE.get().unwrap() {
                    eprintln!(
                    "spn call --block {block} --from {} {contract} {} # => status {status}: {:x}",
                    ADDR.get().unwrap(),
                    const_hex::encode(&calldata),
                    d.clone().unwrap_or_default()
                );
                }
                *LAST_CALL_CALLDATA.get().unwrap().lock().await = d.clone();
                status
            })
        },
    )?;
    linker.func_wrap("vm_hooks", "block_timestamp", |_: Caller<_>| -> i64 {
        *TIMESTAMP.get().unwrap()
    })?;
    linker.func_wrap("vm_hooks", "block_number", |_: Caller<_>| -> u64 {
        *BLOCK.get().unwrap()
    })?;
    linker.func_wrap("vm_hooks", "block_basefee", |_: Caller<_>, ptr: i32| {})?;
    linker.func_wrap(
        "vm_hooks",
        "block_coinbase",
        |_: Caller<_>, dst_ptr: i32| {},
    )?;
    linker.func_wrap("vm_hooks", "block_gas_limit", |_: Caller<_>| -> u64 { 0 })?;
    linker.func_wrap("vm_hooks", "evm_gas_left", |_: Caller<_>| -> u64 {
        u64::MAX
    })?;
    linker.func_wrap("vm_hooks", "evm_ink_left", |_: Caller<_>| -> u64 {
        u64::MAX
    })?;
    linker.func_wrap(
        "vm_hooks",
        "account_balance",
        |_: Caller<_>, addr_ptr: i32, dest_ptr: i32| {},
    )?;
    linker.func_wrap(
        "vm_hooks",
        "account_code",
        |_: Caller<_>, address_ptr: i32, offset: u32, size: u32, dest_ptr: i32| -> u32 { 0 },
    )?;
    linker.func_wrap(
        "vm_hooks",
        "account_code_size",
        |_: Caller<_>, addr_ptr: i32| -> u32 { 0 },
    )?;
    linker.func_wrap(
        "vm_hooks",
        "account_codehash",
        |_: Caller<_>, addr_ptr: i32, dest_ptr: i32| {},
    )?;
    linker.func_wrap("vm_hooks", "tx_ink_price", |_: Caller<_>| -> u32 { 0 })?;
    linker.func_wrap("vm_hooks", "tx_gas_price", |_: Caller<_>, dst_ptr: i32| {})?;
    linker.func_wrap(
        "vm_hooks",
        "tx_origin",
        |mut caller: Caller<_>, ptr: i32| {
            let mem = caller.get_export("memory").unwrap().into_memory().unwrap();
            unsafe {
                std::ptr::copy(
                    SENDER.get().unwrap().as_slice().as_ptr(),
                    mem.data_ptr(&mut caller).offset(ptr as isize),
                    20,
                );
            }
        },
    )?;
    linker.func_wrap(
        "vm_hooks",
        "delegate_call_contract",
        |_: Caller<_>, _: i32, _: i32, _: i32, _: i64, _: i32| -> i32 {
            // Use debug_traceCall with stateOverride to copy the storage that we have in this
            // contract to the other contract with a call. Store any SSTORE interactions to this
            // contract.
            unreachable!()
        },
    )?;
    linker.func_wrap_async(
        "vm_hooks",
        "static_call_contract",
        move |mut caller: Caller<_>,
              (contract_ptr, calldata_ptr, calldata_len, gas, return_data_len_ptr): (
            i32,
            i32,
            i32,
            i64,
            i32,
        )| {
            Box::new(async move {
                // Copy of the call implementation.
                let mem = caller.get_export("memory").unwrap().into_memory().unwrap();
                let mut contract = [0_u8; 20];
                let mut calldata = Vec::with_capacity(calldata_len as usize);
                unsafe {
                    std::ptr::copy(
                        mem.data_ptr(&mut caller).offset(contract_ptr as isize),
                        contract.as_mut_ptr(),
                        contract.len(),
                    );
                    std::ptr::copy(
                        mem.data_ptr(&mut caller).offset(calldata_ptr as isize),
                        calldata.as_mut_ptr(),
                        calldata_len as usize,
                    );
                    calldata.set_len(calldata_len as usize);
                }
                let contract = Address::from(contract);
                // Below, we're using debug_tracecall for this. It would
                // be preferable to use eth_simulate now.
                let trace = PROVIDER
                    .get()
                    .unwrap()
                    .lock()
                    .await
                    .debug_trace_call(
                        {
                            let mut t = TransactionRequest::default();
                            t.from = Some(*ADDR.get().unwrap());
                            t.to = Some(TxKind::Call(contract));
                            t.input = TransactionInput {
                                input: Some(Bytes::copy_from_slice(&calldata)),
                                data: None,
                            };
                            t.gas = if gas > 0 {
                                Some(gas.try_into().unwrap())
                            } else {
                                None
                            };
                            t
                        },
                        BlockId::Number(BlockNumberOrTag::Number(*BLOCK.get().unwrap())),
                        GethDebugTracingCallOptions {
                            tracing_options: GethDebugTracingOptions::mux_tracer({
                                let mut h = MuxConfig::default();
                                h.0.insert(
                                    GethDebugBuiltInTracerType::CallTracer,
                                    Some(
                                        CallConfig {
                                            only_top_call: Some(true),
                                            with_log: Some(false),
                                        }
                                        .into(),
                                    ),
                                );
                                h.0.insert(
                                    GethDebugBuiltInTracerType::PreStateTracer,
                                    Some(
                                        PreStateConfig {
                                            diff_mode: Some(true),
                                            disable_code: Some(true),
                                            disable_storage: None,
                                        }
                                        .into(),
                                    ),
                                );
                                h
                            }),
                            block_overrides: Some({
                                let mut b = BlockOverrides::default();
                                b.time = Some(*TIMESTAMP.get().unwrap() as u64);
                                b
                            }),
                            state_overrides: Some(
                                STATE_OVERRIDES.get().unwrap().lock().await.clone(),
                            ),
                        },
                    )
                    .await;
                let trace = trace.unwrap().try_into_mux_frame().unwrap();
                match trace
                    .0
                    .get(&GethDebugBuiltInTracerType::PreStateTracer)
                    .unwrap()
                {
                    PreStateTracer(PreStateFrame::Diff(DiffMode { post, .. })) => {
                        let mut state_overrides = STATE_OVERRIDES.get().unwrap().lock().await;
                        for (addr, state) in post {
                            if *addr == address!("A4b05FffffFffFFFFfFFfffFfffFFfffFfFfFFFf") {
                                eprintln!("refusing to set to arbos with a state override");
                                continue;
                            }
                            // It's not clear to me whether this is needed, but we're explicitly
                            // merging this anyway.
                            let o = state_overrides
                                .entry(*addr)
                                .or_insert_with(AccountOverride::default);
                            o.balance = state.balance;
                            o.nonce = state.nonce;
                            o.code = state.code.clone();
                            let storage = state.storage.iter();
                            match &mut o.state {
                                Some(state) => state.extend(storage),
                                None => {
                                    let mut h = HashMap::with_hasher(FbBuildHasher::default());
                                    h.extend(storage);
                                    o.state = Some(h)
                                }
                            }
                        }
                    }
                    a => panic!("not diff prestate tracer in mux: {a:?}"),
                };
                let (d, status) = match trace
                    .0
                    .get(&GethDebugBuiltInTracerType::CallTracer)
                    .unwrap()
                {
                    CallTracer(CallFrame { output, error, .. }) => (
                        output,
                        match error {
                            None => 0,
                            Some(_) => 1,
                        },
                    ),
                    a => panic!("not calltracer in mux: {a:?}"),
                };
                if let Some(d) = d.clone() {
                    unsafe {
                        std::ptr::copy(
                            d.len().to_le_bytes().as_ptr(),
                            mem.data_ptr(&mut caller)
                                .offset(return_data_len_ptr as isize),
                            std::mem::size_of::<u64>(),
                        )
                    }
                }
                let block = *BLOCK.get().unwrap();
                if *VERBOSE.get().unwrap() {
                    eprintln!(
                    "spn call --block {block} --from {} {contract} {} # => status {status}: {:x}",
                    ADDR.get().unwrap(),
                    const_hex::encode(&calldata),
                    d.clone().unwrap_or_default()
                );
                }
                *LAST_CALL_CALLDATA.get().unwrap().lock().await = d.clone();
                status
            })
        },
    )?;
    linker.func_wrap_async(
        "vm_hooks",
        "return_data_size",
        |_: Caller<_>, ()| -> Box<dyn Future<Output = i32> + Send> {
            Box::new(async move {
                LAST_CALL_CALLDATA
                    .get()
                    .unwrap()
                    .lock()
                    .await
                    .clone()
                    .map_or(0, |x| x.len()) as i32
            })
        },
    )?;
    linker.func_wrap_async(
        "vm_hooks",
        "read_return_data",
        |mut caller: Caller<_>,
         (dest_ptr, copy_offset, len): (i32, i32, i32)|
         -> Box<dyn Future<Output = i32> + Send> {
            Box::new(async move {
                let mem = caller.get_export("memory").unwrap().into_memory().unwrap();
                match LAST_CALL_CALLDATA.get().unwrap().lock().await.as_deref() {
                    Some(b) => {
                        let b = &b[copy_offset as usize..copy_offset as usize + len as usize];
                        unsafe {
                            std::ptr::copy(
                                b.as_ptr(),
                                mem.data_ptr(&mut caller).offset(dest_ptr as isize),
                                len as usize,
                            );
                        };
                        len
                    }
                    None => 0,
                }
            })
        },
    )?;
    linker.func_wrap_async("vm_hooks", "storage_cache_bytes32", {
        move |mut caller: Caller<_>,
              (key_ptr, val_ptr): (i32, i32)|
              -> Box<dyn Future<Output = ()> + Send> {
            Box::new(async move {
                let mut key = [0u8; 32];
                let mut val = [0u8; 32];
                let mem = caller.get_export("memory").unwrap().into_memory().unwrap();
                unsafe {
                    std::ptr::copy(
                        mem.data_ptr(&mut caller).offset(key_ptr as isize),
                        key.as_mut_ptr(),
                        32,
                    );
                    std::ptr::copy(
                        mem.data_ptr(&mut caller).offset(val_ptr as isize),
                        val.as_mut_ptr(),
                        32,
                    );
                }
                if *VERBOSE.get().unwrap() {
                    eprintln!(
                        "written: {}: {}",
                        const_hex::encode(key),
                        const_hex::encode(val)
                    );
                }
                STORAGE_WRITTEN.get().unwrap().lock().await.insert(key, val);
            })
        }
    })?;
    linker.func_wrap(
        "vm_hooks",
        "msg_sender",
        |mut caller: Caller<_>, ptr: i32| {
            let mem = caller.get_export("memory").unwrap().into_memory().unwrap();
            unsafe {
                std::ptr::copy(
                    SENDER.get().unwrap().as_slice().as_ptr(),
                    mem.data_ptr(&mut caller).offset(ptr as isize),
                    20,
                );
            }
        },
    )?;
    linker.func_wrap(
        "vm_hooks",
        "contract_address",
        |mut caller: Caller<_>, ptr: i32| {
            let mem = caller.get_export("memory").unwrap().into_memory().unwrap();
            unsafe {
                std::ptr::copy(
                    ADDR.get().unwrap().as_slice().as_ptr(),
                    mem.data_ptr(&mut caller).offset(ptr as isize),
                    20,
                );
            }
        },
    )?;
    linker.func_wrap("vm_hooks", "pay_for_memory_grow", |_: Caller<_>, _: i32| {})?;
    linker.func_wrap("vm_hooks", "exit_early", |_: Caller<_>, code: i32| {
        eprintln!("exit_early was invoked: {code}");
        process::exit(code);
        #[allow(unused)]
        Ok(())
    })?;

    // Handy console logging functions that Stylus gives us.
    linker.func_wrap("console", "log_f32", |_: Caller<_>, value: f32| {
        if *VERBOSE.get().unwrap() {
            eprintln!("log: {value}");
        }
    })?;
    linker.func_wrap("console", "log_f64", |_: Caller<_>, value: f64| {
        if *VERBOSE.get().unwrap() {
            eprintln!("log: {value}");
        }
    })?;
    linker.func_wrap("console", "log_i32", |_: Caller<_>, value: i32| {
        if *VERBOSE.get().unwrap() {
            eprintln!("log: {value}");
        }
    })?;
    linker.func_wrap("console", "log_i64", |_: Caller<_>, value: i64| {
        if *VERBOSE.get().unwrap() {
            eprintln!("log: {value}");
        }
    })?;

    linker.func_wrap(
        "console",
        "log_txt",
        |mut caller: Caller<_>, ptr: i32, len: i32| {
            let mem = caller.get_export("memory").unwrap().into_memory().unwrap();
            let mut buf = Vec::with_capacity(len as usize);
            unsafe {
                std::ptr::copy(
                    mem.data_ptr(&mut caller).offset(ptr as isize),
                    buf.as_mut_ptr(),
                    len as usize,
                );
                buf.set_len(len as usize);
            }
            if *VERBOSE.get().unwrap() {
                eprintln!("{}", String::from_utf8(buf).unwrap())
            }
        },
    )?;

    linker.func_wrap(
        "stylus_interpreter",
        "simpledie",
        |_: Caller<_>, code: i32| {
            eprintln!("simple die exit: {code}");
            process::exit(code);
            #[allow(unused)]
            Ok(())
        },
    )?;
    linker.func_wrap(
        "stylus_interpreter",
        "die",
        |mut caller: Caller<_>, ptr: i32, len: i32, code: i32| {
            let mem = caller.get_export("memory").unwrap().into_memory().unwrap();
            let mut buf = Vec::with_capacity(len as usize);
            unsafe {
                std::ptr::copy(
                    mem.data_ptr(&mut caller).offset(ptr as isize),
                    buf.as_mut_ptr(),
                    len as usize,
                );
                buf.set_len(len as usize);
            }
            if *VERBOSE.get().unwrap() {
                eprintln!("exit: {}", String::from_utf8(buf).unwrap());
            }
            process::exit(code);
            #[allow(unused)]
            Ok(())
        },
    )?;
    // Custom features defined by us for varying reasons.
    linker.func_wrap(
        "stylus_test_runner",
        "set_msg_sender",
        |mut caller: Caller<_>, ptr: i32| {
            // Set the msg::sender to the storage that we have.
            let mem = caller.get_export("memory").unwrap().into_memory().unwrap();
            let mut arr = [0_u8; 20];
            unsafe {
                std::ptr::copy(
                    mem.data_ptr(&mut caller).offset(ptr as isize),
                    arr.as_mut_ptr(),
                    20,
                );
            }
        },
    )?;
    linker.func_wrap(
        "stylus_test_runner",
        "wasm_request_rand",
        |mut caller: Caller<_>, ptr: i32, len: i32| {
            // Get some random for the user from the PRG (100 bits).
            let mut buf = Vec::with_capacity(len as usize);
            getrandom::getrandom(&mut buf).unwrap();
            let mem = caller.get_export("memory").unwrap().into_memory().unwrap();
            mem.write(&mut caller, ptr as usize, &buf).unwrap();
        },
    )?;

    let instance = linker.instantiate_async(&mut store, &module).await?;

    let entrypoint = instance.get_typed_func::<i32, i32>(&mut store, &args.function_name)?;
    for i in 0..invocation_count {
        // Start to unpack the hashmap that contains the storage here if the argument is set.
        if should_state_override {
            for (mut addr, v) in &default_state {
                if addr.is_zero() {
                    addr = ADDR.get().unwrap();
                }
                if addr == ADDR.get().unwrap() {
                    // If the user sets the storage for this contract, then we need to
                    // override the local storage, not the state forking config for calling
                    // out.
                    for (k, v) in v {
                        let k: [u8; 32] = k.as_slice().try_into().unwrap();
                        let v: [u8; 32] =
                            FixedBytes::<32>::from_str(&replace_str(&mut rng, v.clone()))
                                .unwrap()
                                .as_slice()
                                .try_into()
                                .unwrap();
                        STORAGE_WRITTEN.get().unwrap().lock().await.insert(k, v);
                    }
                } else {
                    // If the contract address is different, then we'll set the call
                    // overrides.
                    let mut state_overrides = STATE_OVERRIDES.get().unwrap().lock().await;
                    let o = state_overrides.entry(*addr).or_insert_with(|| {
                        let mut o = AccountOverride::default();
                        let h: HashMap<FixedBytes<32>, FixedBytes<32>, _> =
                            HashMap::with_hasher(FbBuildHasher::default());
                        o.state_diff = Some(h);
                        o
                    });
                    for (k, v) in v {
                        let v =
                            FixedBytes::<32>::from_str(&replace_str(&mut rng, v.clone())).unwrap();
                        o.state_diff.as_mut().unwrap().insert(*k, v);
                    }
                }
            }
        }
        if *VERBOSE.get().unwrap() {
            eprintln!(
                "state override for external calls by invocation {i}: {:?}",
                STATE_OVERRIDES.get().unwrap().lock().await
            );
            eprintln!(
                "storage override for local running {i}: {:?}",
                STORAGE_WRITTEN.get().unwrap().lock().await
            );
        }
        let rc = entrypoint
            .call_async(&mut store, calldata_len as i32)
            .await?;
        if *VERBOSE.get().unwrap() {
            eprintln!("{rc}",);
        }
    }
    Ok(())
}

fn replace_str<T: Rng>(rng: &mut T, s: String) -> String {
    s.chars()
        .map(|c| {
            if c == 'X' {
                match rng.random_range(0..16) {
                    0..=9 => (b'0' + rng.random_range(0..=9)) as char,
                    10..=15 => (b'a' + rng.random_range(0..=5)) as char,
                    _ => unreachable!(),
                }
            } else {
                c
            }
        })
        .collect::<String>()
}
