#![doc(hidden)]

use std::{cell::RefCell, collections::HashMap, ptr};

use stylus_sdk::alloy_primitives::{Address, U256};

use crate::testing_addrs;

const WORD_BYTES: usize = 32;
pub type Word = [u8; WORD_BYTES];

thread_local! {
    static STORAGE: RefCell<HashMap<Word, Word>> = RefCell::new(HashMap::new());
    static CUR_TIME: RefCell<u64> = const { RefCell::new(0) };
    static MSG_SENDER: RefCell<Address> = const { RefCell::new(testing_addrs::MSG_SENDER) };
    static REGISTERED_ADDRESSES: RefCell<HashMap<Address, String>> =
        RefCell::new(HashMap::new());
}

// Helpful memory of the contract address of the currently executing contract.
pub const CONTRACT_ADDRESS: Address = testing_addrs::CONTRACT;

unsafe fn read_word(key: *const u8) -> Word {
    let mut res = Word::default();
    ptr::copy(key, res.as_mut_ptr(), WORD_BYTES);
    res
}

unsafe fn write_word(key: *mut u8, val: Word) {
    ptr::copy(val.as_ptr(), key, WORD_BYTES);
}

#[no_mangle]
pub unsafe extern "C" fn storage_store_bytes32(key: *const u8, value: *const u8) {
    let (key, value) = unsafe {
        // SAFETY - stylus insists these will both be valid words
        (read_word(key), read_word(value))
    };
    STORAGE.with(|storage| storage.borrow_mut().insert(key, value));
}

#[no_mangle]
pub unsafe extern "C" fn storage_cache_bytes32(key: *const u8, value: *const u8) {
    // do the same as storage... for now. if the tests are more comprehensive
    // this may need to change.
    storage_store_bytes32(key, value);
}

#[no_mangle]
pub unsafe extern "C" fn native_keccak256(bytes: *const u8, len: usize, output: *mut u8) {
    // SAFETY
    // stylus promises `bytes` will have length `len`, `output` will have length one word
    use std::slice;
    use tiny_keccak::{Hasher, Keccak};

    let mut hasher = Keccak::v256();

    let data = unsafe { slice::from_raw_parts(bytes, len) };
    hasher.update(data);

    let output = unsafe { slice::from_raw_parts_mut(output, 32) };
    hasher.finalize(output);
}

#[no_mangle]
pub fn block_timestamp() -> u64 {
    CUR_TIME.with(|v| v.clone().into_inner())
}

pub fn ts_add_time(secs: u64) {
    CUR_TIME.with(|v| *v.borrow_mut() += secs);
}

pub fn set_block_timestamp(t: u64) {
    CUR_TIME.with(|v| *v.borrow_mut() = t);
}

#[no_mangle]
pub unsafe fn storage_flush_cache(_clear: bool) {}

#[no_mangle]
pub unsafe extern "C" fn emit_log(_pointer: *const u8, _len: usize, _: usize) {}

#[no_mangle]
pub unsafe extern "C" fn storage_load_bytes32(key: *const u8, out: *mut u8) {
    // SAFETY - stylus promises etc
    let key = unsafe { read_word(key) };

    let value = STORAGE.with(|storage| {
        storage
            .borrow()
            .get(&key)
            .map(Word::to_owned)
            .unwrap_or_default()
    });

    unsafe { write_word(out, value) };
}

// We avoid setting this and contract_address so that we use our internal
// function, since Stylus does some caching.
#[no_mangle]
pub unsafe extern "C" fn msg_sender(_ptr: *mut u8) {}

#[no_mangle]
#[cfg(not(target_arch = "wasm32"))]
pub extern "C" fn tx_gas_price(_gas_price: *mut u8) {}

#[no_mangle]
#[cfg(not(target_arch = "wasm32"))]
pub extern "C" fn tx_ink_price() -> u32 {
    0
}

#[no_mangle]
#[cfg(not(target_arch = "wasm32"))]
pub extern "C" fn tx_origin(_origin: *mut u8) {}

#[no_mangle]
#[cfg(not(target_arch = "wasm32"))]
pub extern "C" fn pay_for_memory_grow(_pages: u16) {}

#[no_mangle]
#[cfg(not(target_arch = "wasm32"))]
pub extern "C" fn read_args(_dest: *mut u8) {}

#[no_mangle]
#[cfg(not(target_arch = "wasm32"))]
pub extern "C" fn account_balance(_address: *const u8, _dest: *mut u8) {}

#[no_mangle]
#[cfg(not(target_arch = "wasm32"))]
pub extern "C" fn account_code(
    _address: *const u8,
    _offset: usize,
    _size: usize,
    _dest: *mut u8,
) -> usize {
    0
}

#[no_mangle]
#[cfg(not(target_arch = "wasm32"))]
pub extern "C" fn account_code_size(_address: *const u8) -> usize {
    0
}

#[no_mangle]
#[cfg(not(target_arch = "wasm32"))]
pub extern "C" fn account_codehash(_address: *const u8, _dest: *mut u8) {}

#[no_mangle]
#[cfg(not(target_arch = "wasm32"))]
pub extern "C" fn block_basefee(_basefee: *mut u8) {}

#[no_mangle]
#[cfg(not(target_arch = "wasm32"))]
pub extern "C" fn chainid() -> u64 {
    0
}

#[no_mangle]
#[cfg(not(target_arch = "wasm32"))]
pub extern "C" fn block_coinbase(_coinbase: *mut u8) {}

#[no_mangle]
#[cfg(not(target_arch = "wasm32"))]
pub extern "C" fn block_gas_limit() -> u64 {
    0
}

#[no_mangle]
#[cfg(not(target_arch = "wasm32"))]
pub extern "C" fn block_number() -> u64 {
    0
}

#[no_mangle]
#[cfg(not(target_arch = "wasm32"))]
pub extern "C" fn call_contract(
    _contract: *const u8,
    _calldata: *const u8,
    _calldata_len: usize,
    _value: *const u8,
    _gas: u64,
    _return_data_len: *mut usize,
) -> u8 {
    1
}

#[no_mangle]
#[cfg(not(target_arch = "wasm32"))]
pub extern "C" fn contract_address(_address: *mut u8) {}

#[no_mangle]
#[cfg(not(target_arch = "wasm32"))]
pub extern "C" fn create1(
    _code: *const u8,
    _code_len: usize,
    _endowment: *const u8,
    _contract: *mut u8,
    _revert_data_len: *mut usize,
) {
}

#[no_mangle]
#[cfg(not(target_arch = "wasm32"))]
pub extern "C" fn create2(
    _code: *const u8,
    _code_len: usize,
    _endowment: *const u8,
    _salt: *const u8,
    _contract: *mut u8,
    _revert_data_len: *mut usize,
) {
}

#[no_mangle]
#[cfg(not(target_arch = "wasm32"))]
pub extern "C" fn delegate_call_contract(
    _contract: *const u8,
    _calldata: *const u8,
    _calldata_len: usize,
    _gas: u64,
    _return_data_len: *mut usize,
) -> u8 {
    1
}

#[no_mangle]
#[cfg(not(target_arch = "wasm32"))]
pub extern "C" fn evm_gas_left() -> u64 {
    0
}

#[no_mangle]
#[cfg(not(target_arch = "wasm32"))]
pub extern "C" fn evm_ink_left() -> u64 {
    0
}

#[no_mangle]
#[cfg(not(target_arch = "wasm32"))]
pub extern "C" fn msg_reentrant() -> bool {
    false
}

#[no_mangle]
#[cfg(not(target_arch = "wasm32"))]
pub extern "C" fn msg_value(_value: *mut u8) {}

#[no_mangle]
#[cfg(not(target_arch = "wasm32"))]
pub extern "C" fn read_return_data(_dest: *mut u8, _offset: usize, _size: usize) -> usize {
    0
}

#[no_mangle]
#[cfg(not(target_arch = "wasm32"))]
pub extern "C" fn write_result(_data: *const u8, _len: usize) {}

#[no_mangle]
#[cfg(not(target_arch = "wasm32"))]
pub extern "C" fn return_data_size() -> usize {
    0
}

#[no_mangle]
#[cfg(not(target_arch = "wasm32"))]
pub extern "C" fn static_call_contract(
    _contract: *const u8,
    _calldata: *const u8,
    _calldata_len: usize,
    _gas: u64,
    _return_data_len: *mut usize,
) -> u8 {
    1
}
pub fn get_msg_sender() -> Address {
    MSG_SENDER.with(|v| v.clone().into_inner())
}

pub fn set_msg_sender(a: Address) {
    MSG_SENDER.with(|v| *v.borrow_mut() = a)
}

pub fn reset_msg_sender() {
    set_msg_sender(testing_addrs::MSG_SENDER)
}

pub fn get_contract_address() -> Address {
    CONTRACT_ADDRESS
}

pub fn clear_storage() {
    STORAGE.with(|s| s.borrow_mut().clear());
}

pub fn get_addr_expl(addr: Address) -> Option<String> {
    REGISTERED_ADDRESSES.with(|h| h.borrow().get(&addr).map(|x| x.clone()))
}

pub fn register_addr(addr: Address, expl: String) {
    REGISTERED_ADDRESSES.with(|h| h.borrow_mut().insert(addr, expl));
}

#[allow(dead_code)]
pub fn with_contract<T, P: StorageNew, F: FnOnce(&mut P) -> T>(f: F) -> T {
    clear_storage();
    set_msg_sender(testing_addrs::MSG_SENDER);
    set_block_timestamp(0);
    f(&mut P::new(U256::ZERO, 0))
}

#[cfg(feature = "testing")]
#[allow(dead_code)]
pub trait StorageNew {
    fn new(i: U256, v: u8) -> Self;
}
