use std::{collections::HashMap, env, future::Future, process, str::FromStr, sync::OnceLock};

use keccak_const::Keccak256;

use alloy_primitives::{Address, U256};
use alloy_provider::{Provider, RootProvider};

use url::Url;

use wasmtime::*;

use tokio::sync::Mutex;

type Word = [u8; 32];

#[tokio::main]
async fn main() -> Result<(), Error> {
    let engine = Engine::new(Config::new().wasm_backtrace(true).async_support(true)).unwrap();
    let [_, sender_str, block, addr, file, calldata]: [String; 6] =
        env::args().take(6).collect::<Vec<_>>().try_into().unwrap();
    static SENDER: OnceLock<Address> = OnceLock::new();
    SENDER.set(Address::from_str(&sender_str).unwrap()).unwrap();
    let block = u64::from_str(&block).unwrap();
    let addr = Address::from_str(&addr).unwrap();
    let module = Module::from_file(&engine, file.clone()).unwrap();

    eprintln!("stylus-interpreter {sender_str} {block} {addr} {file} {calldata}",);

    let calldata = const_hex::decode(calldata).unwrap();
    let calldata_len = calldata.len();

    let mut store: Store<()> = Store::new(&engine, ());
    let mut linker = Linker::new(&engine);

    static PROVIDER: OnceLock<Mutex<RootProvider<alloy_transport_http::Http<reqwest::Client>>>> =
        OnceLock::new();
    PROVIDER
        .set(Mutex::new(RootProvider::new_http(
            Url::parse("http://localhost:9999").unwrap(),
        )))
        .unwrap();

    // Storage written is used to store the storage that we've committed to storage, or
    // storage used by other contracts. The 0 word is used by our contract.
    static STORAGE_WRITTEN: OnceLock<Mutex<HashMap<Word, Word>>> = OnceLock::new();
    STORAGE_WRITTEN.set(Mutex::new(HashMap::new())).unwrap();

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
            // Use const_keccak for whatever we have, and return it.
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
            // Use const_keccak for whatever we have, and return it.
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
                        .get_storage_at(addr, U256::from_be_bytes(word))
                        .number(block)
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
    linker.func_wrap(
        "vm_hooks",
        "call_contract",
        |_: Caller<_>, _: i32, _: i32, _: i32, _: i32, _: i64, _: i32| -> i32 {
            // Use the eth_debugcall function with the rpc to simulate the experience of
            // calling a contract that's presumably deployed there. Look at the storage slots
            // that were used in the operation, and write every SSTORE and result of
            // SLOAD that's used to our storage hashmap for the contract's address.
            0
        },
    )?;
    linker.func_wrap(
        "vm_hooks",
        "delegate_call_contract",
        |_: Caller<_>, _: i32, _: i32, _: i32, _: i64, _: i32| -> i32 {
            // Use debug_traceCall with stateOverride to copy the storage that we have in this
            // contract to the other contract with a call. Store any SSTORE interactions to this
            // contract.
            0
        },
    )?;
    linker.func_wrap(
        "vm_hooks",
        "static_call_contract",
        |_: Caller<_>, _: i32, _: i32, _: i32, _: i64, _: i32| -> i32 {
            // Use the debug_traceCall function with the rpc to simulate the experience of
            // calling a contract that's presumably deployed there. Store any SLOADs that take
            // place during that operation in the hashmap for here.
            0
        },
    )?;
    linker.func_wrap("vm_hooks", "return_data_size", |_: Caller<_>| -> i32 { 0 })?;
    linker.func_wrap(
        "vm_hooks",
        "read_return_data",
        |_: Caller<_>, _dest: i32, _offset: i32, _size: i32| -> i32 { 0 },
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
    linker.func_wrap("vm_hooks", "contract_address", |_: Caller<_>, _: i32| {})?;
    linker.func_wrap("vm_hooks", "pay_for_memory_grow", |_: Caller<_>, _: i32| {})?;

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
            eprintln!("{}", String::from_utf8(buf).unwrap());
            process::exit(code);
        },
    )?;

    let instance = linker.instantiate_async(&mut store, &module).await?;

    let entrypoint = instance.get_typed_func::<i32, i32>(&mut store, "user_entrypoint")?;
    eprintln!(
        "{}",
        entrypoint
            .call_async(&mut store, calldata_len as i32)
            .await?
    );
    Ok(())
}