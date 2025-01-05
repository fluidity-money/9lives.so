use std::{collections::HashMap, future::Future, process, str::FromStr, sync::OnceLock};

use keccak_const::Keccak256;

use alloy_eips::{BlockId, BlockNumberOrTag};
use alloy_network_primitives::BlockTransactionsKind;
use alloy_primitives::{
    map::{AddressHashMap, FbBuildHasher},
    Address, Bytes, TxKind, U256,
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

type Word = [u8; 32];

#[derive(Parser)]
#[command(version, about)]
struct Args {
    #[arg(short, long)]
    sender: String,
    #[arg(short, long)]
    block: u64,
    #[arg(short, long)]
    addr: String,
    #[arg(short, long, group = "action")]
    calldata: String,

    #[arg(short, long, group = "action")]
    run_tests: bool,

    #[arg(short, long, required = true)]
    file: String,
}

#[tokio::main]
async fn main() -> Result<(), Error> {
    let args = Args::parse();

    static SENDER: OnceLock<Address> = OnceLock::new();
    static BLOCK: OnceLock<u64> = OnceLock::new();
    static ADDR: OnceLock<Address> = OnceLock::new();
    static TIMESTAMP: OnceLock<i64> = OnceLock::new();

    SENDER
        .set(Address::from_str(&args.sender).unwrap())
        .unwrap();
    BLOCK.set(args.block).unwrap();

    static PROVIDER: OnceLock<Mutex<RootProvider<alloy_transport_http::Http<reqwest::Client>>>> =
        OnceLock::new();
    PROVIDER
        .set(Mutex::new(RootProvider::new_http(
            Url::parse("http://localhost:9999").unwrap(),
        )))
        .unwrap();

    ADDR.set(Address::from_str(&args.addr).unwrap()).unwrap();
    TIMESTAMP
        .set(
            u64::from_be_bytes(
                PROVIDER
                    .get()
                    .unwrap()
                    .lock()
                    .await
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
            println!("0x{}", const_hex::encode(&arr))
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
    linker.func_wrap(
        "vm_hooks",
        "create1",
        |_: Caller<_>,
         _code: i32,
         _code_len: i32,
         _endowment: i32,
         _contract: i32,
         _revert_data_len: i32| {
            // Simulate a creation by simulating the deployment of the contract using
            // a prestate tracer, then remembering the runtime code at the post state
            // address the same way we remember other state changes. Store the address.
        },
    )?;
    linker.func_wrap(
        "vm_hooks",
        "create2",
        |_: Caller<_>,
         _code: i32,
         _code_len: i32,
         _endowment: i32,
         _salt: i32,
         _contract: i32,
         _revert_data_len: i32| {
            // Use a similar process as create1.
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
                let mut storage_written = STORAGE_WRITTEN.get().unwrap().lock().await;
                unsafe {
                    std::ptr::copy(
                        mem.data_ptr(&mut caller).offset(key_ptr as isize),
                        word.as_mut_ptr(),
                        32,
                    );
                }
                let v = if let Some(v) = storage_written.get(&word) {
                    *v
                } else {
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
                eprintln!(
                    "word: {}: {}",
                    const_hex::encode(word),
                    const_hex::encode(v)
                );
            })
        },
    )?;
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
                        TransactionRequest {
                            from: Some(*ADDR.get().unwrap()),
                            to: Some(TxKind::Call(contract)),
                            input: TransactionInput {
                                input: Some(Bytes::copy_from_slice(&calldata)),
                                data: None,
                            },
                            gas_price: None,
                            max_fee_per_gas: None,
                            max_priority_fee_per_gas: None,
                            max_fee_per_blob_gas: None,
                            gas: if gas > 0 {
                                Some(gas.try_into().unwrap())
                            } else {
                                None
                            },
                            value: Some(U256::from_be_bytes(value)),
                            nonce: None,
                            chain_id: None,
                            access_list: None,
                            transaction_type: None,
                            blob_versioned_hashes: None,
                            sidecar: None,
                            authorization_list: None,
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
                eprintln!(
                    "spn call --from {} {contract} {} # => status {status}: {:x}",
                    ADDR.get().unwrap(),
                    const_hex::encode(&calldata),
                    d.clone().unwrap_or_default()
                );
                *LAST_CALL_CALLDATA.get().unwrap().lock().await = d.clone();
                status
            })
        },
    )?;
    linker.func_wrap("vm_hooks", "block_timestamp", |_: Caller<_>| -> i64 {
        *TIMESTAMP.get().unwrap()
    })?;
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
    linker.func_wrap(
        "vm_hooks",
        "static_call_contract",
        |_: Caller<_>, _: i32, _: i32, _: i32, _: i64, _: i32| -> i32 {
            // Use the debug_traceCall function with the rpc to simulate the experience of
            // calling a contract that's presumably deployed there. Store any SLOADs that take
            // place during that operation in the hashmap for here.
            unreachable!()
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

    // Handy console logging functions that Stylus gives us.
    linker.func_wrap("console", "log_f32", |_: Caller<_>, value: f32| {
        eprintln!("log: {value}");
    })?;
    linker.func_wrap("console", "log_f64", |_: Caller<_>, value: f64| {
        eprintln!("log: {value}");
    })?;
    linker.func_wrap("console", "log_i32", |_: Caller<_>, value: i32| {
        eprintln!("log: {value}");
    })?;
    linker.func_wrap("console", "log_i64", |_: Caller<_>, value: i64| {
        eprintln!("log: {value}");
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
            eprintln!("{}", String::from_utf8(buf).unwrap())
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
            eprintln!("exit: {}", String::from_utf8(buf).unwrap());
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

    if args.run_tests {
        let exports = instance
            .exports(&mut store)
            .map(|x| x.name().to_owned())
            .collect::<Vec<_>>();
        for f_name in exports {
            if f_name.starts_with("stylus_interpreter_test") {
                let mut results = Vec::with_capacity(1);
                match instance.get_func(&mut store, &f_name).unwrap().call(
                    &mut store,
                    &[],
                    &mut results,
                ) {
                    Ok(_) => (),
                    err => {
                        eprintln!("fname {f_name}: {:?}", err)
                    }
                }
            }
        }
    } else {
        let entrypoint = instance.get_typed_func::<i32, i32>(&mut store, "user_entrypoint")?;
        eprintln!(
            "{}",
            entrypoint
                .call_async(&mut store, calldata_len as i32)
                .await?
        );
    }

    Ok(())
}
