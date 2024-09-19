use std::{cell::RefCell, collections::HashMap, ptr, time};

use stylus_sdk::alloy_primitives::U256;

const WORD_BYTES: usize = 32;
pub type Word = [u8; WORD_BYTES];

thread_local! {
    static STORAGE: RefCell<HashMap<Word, Word>> = RefCell::new(HashMap::new());
}

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
    time::SystemTime::now()
        .duration_since(time::UNIX_EPOCH)
        .unwrap()
        .as_secs()
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

#[no_mangle]
pub unsafe extern "C" fn msg_sender(_sender: *mut u8) {}

#[no_mangle]
pub unsafe extern "C" fn contract_address(_addr: *mut u8) {}

#[allow(dead_code)]
pub fn with_storage<T, P: StorageNew, F: FnOnce(&mut P) -> T>(f: F) -> T {
    STORAGE.with(|s| s.borrow_mut().clear());
    f(&mut P::new(U256::ZERO, 0))
}

#[cfg(feature = "testing")]
#[allow(dead_code)]
pub trait StorageNew {
    fn new(i: U256, v: u8) -> Self;
}
