#![doc(hidden)]

use stylus_sdk::alloy_primitives::Address;

// We need these for our testing helper functions.
#[allow(unused)]
use stylus_sdk::alloy_primitives::{fixed_bytes, FixedBytes, U256};

#[cfg(all(feature = "testing", not(target_arch = "wasm32")))]
use proptest::prelude::*;

//keccak256(abi.encodePacked("superposition.9lives.time.add"))
pub const STORAGE_ADD_TIME: FixedBytes<32> =
    fixed_bytes!("1034bf4e0ceda10ff9c4b44b7a23917b10fb80c3103da502294c70e79054e669");

//keccak256(abi.encodePacked("superposition.9lives.time.sub"))
pub const STORAGE_SUB_TIME: FixedBytes<32> =
    fixed_bytes!("bc21bb295b95ee34b23dda0ac2e03bf17b4daaf83f6c98c49e1ac7152c7c7210");

#[link(wasm_import_module = "vm_hooks")]
extern "C" {
    pub fn storage_cache_bytes32(key: *const u8, value: *const u8);
    pub fn storage_load_bytes32(key: *const u8, out: *mut u8);
}

unsafe fn load_word(key: FixedBytes<32>) -> U256 {
    let mut out = [0u8; 32];
    storage_load_bytes32(key.as_slice().as_ptr(), out.as_mut_ptr());
    U256::from_be_bytes(out)
}

unsafe fn load_word_u64(key: FixedBytes<32>) -> u64 {
    u64::from_be_bytes(
        load_word(key).to_be_bytes::<32>()[32 - 8..]
            .try_into()
            .unwrap(),
    )
}

unsafe fn store_word(key: FixedBytes<32>, v: U256) {
    storage_cache_bytes32(key.as_slice().as_ptr(), v.to_be_bytes::<32>().as_ptr());
}

unsafe fn store_word_u64(key: FixedBytes<32>, v: u64) {
    store_word(key, U256::from(v))
}

pub fn test_block_timestamp_add_time(t: u64) {
    unsafe {
      store_word_u64(
          STORAGE_ADD_TIME,
          load_word_u64(STORAGE_ADD_TIME) + t
        )
    }
}

#[test]
fn test_test_block_timestamp_adjust_time() {
    test_block_timestamp_add_time(100);
    assert_eq!(100, unsafe { load_word_u64(STORAGE_ADD_TIME) });
    test_block_timestamp_add_time(400);
    assert_eq!(500, unsafe { load_word_u64(STORAGE_ADD_TIME) });
}

#[test]
#[cfg(feature = "e2e-adjust-time")]
fn test_block_timestamp_altered() {
    let cur_time = block_timestamp();
    test_block_timestamp_add_time(500);
    assert_eq!(cur_time + 500, block_timestamp());
    test_block_timestamp_sub_time(200);
    assert_eq!(cur_time + 500 - 200, block_timestamp());
    test_block_timestamp_sub_time(block_timestamp() + 500);
    assert_eq!(0, block_timestamp());
}

// These functions are for instances where someone calls the modify time
// slot functions, to ensure that the production instance won't use this.
#[test]
#[cfg(not(feature = "e2e-adjust-time"))]
fn test_block_timestamp_wont_be_altered() {
    let cur_time = block_timestamp();
    test_block_timestamp_add_time(500);
    assert_eq!(cur_time, block_timestamp());
    test_block_timestamp_sub_time(500);
    assert_eq!(cur_time, block_timestamp());
}

pub fn test_block_timestamp_sub_time(t: u64) {
    unsafe { store_word_u64(STORAGE_SUB_TIME, load_word_u64(STORAGE_SUB_TIME) + t) }
}

// Get the block timestamp. If the e2e code is enabled to adjust the
// time, then this also reads from a storage slot that loads the amount.
pub fn block_timestamp() -> u64 {
    #[cfg(all(feature = "testing", not(target_arch = "wasm32")))]
    let time = crate::host::block_timestamp();
    #[cfg(target_arch = "wasm32")]
    let time = stylus_sdk::block::timestamp();
    #[cfg(feature = "e2e-adjust-time")]
    let time = unsafe {
        let sub = load_word_u64(STORAGE_SUB_TIME);
        let time = time + load_word_u64(STORAGE_ADD_TIME);
        if time >= sub {
            time - sub
        } else {
            0
        }
    };
    time
}

pub fn msg_sender() -> Address {
    #[cfg(all(feature = "testing", not(target_arch = "wasm32")))]
    return crate::host::get_msg_sender();
    #[allow(unreachable_code)]
    stylus_sdk::msg::sender()
}

pub fn contract_address() -> Address {
    #[cfg(all(feature = "testing", not(target_arch = "wasm32")))]
    return crate::host::get_contract_address();
    #[allow(unreachable_code)]
    stylus_sdk::contract::address()
}

#[derive(PartialEq)]
pub enum Uintsize {
    Small,
    Medium,
    Large,
}

/// Simple strategy that generates values up to a million.
#[cfg(all(feature = "testing", not(target_arch = "wasm32")))]
pub fn strat_tiny_u256() -> impl proptest::prelude::Strategy<Value = U256> {
    (0..1_000_000).prop_map(|x| U256::from(x))
}

#[cfg(all(feature = "testing", not(target_arch = "wasm32")))]
pub fn strat_fixed_bytes_sizeable<const N: usize>(
    u: Uintsize,
) -> impl proptest::prelude::Strategy<Value = FixedBytes<N>> {
    // Create a slice of fixed bytes, with a preference for the lower side, a
    // la how I recall seeing Parity's Ethereum client do it. This has a 33%
    // chance of filling out a third of the lower bits, which, in our
    // interpretation, is decoded as big endian in the next function, so
    // the right side, a 33% chance of two thirds, and a 33% chance of
    // everything is potentially filled out.
    (0..3).prop_perturb(move |s, mut rng| {
        let mut x: [u8; N] = [0u8; N];
        let q = N / 3;
        if s == 2 && u == Uintsize::Large {
            for i in q * 2..N {
                x[N - i - 1] = rng.gen();
            }
        }
        if s >= 1 && u != Uintsize::Small {
            for i in q..q * 2 {
                x[N - i - 1] = rng.gen();
            }
        }
        for i in 0..q {
            x[N - i - 1] = rng.gen();
        }
        FixedBytes::<N>::from(x)
    })
}

#[cfg(all(feature = "testing", not(target_arch = "wasm32")))]
pub fn strat_u256(s: Uintsize) -> impl proptest::prelude::Strategy<Value = U256> {
    strat_fixed_bytes_sizeable::<32>(s).prop_map(|x| U256::from_be_bytes(x.into()))
}

#[cfg(all(feature = "testing", not(target_arch = "wasm32")))]
pub fn strat_small_u256() -> impl proptest::prelude::Strategy<Value = U256> {
    strat_u256(Uintsize::Small)
}

#[cfg(all(feature = "testing", not(target_arch = "wasm32")))]
pub fn strat_medium_u256() -> impl proptest::prelude::Strategy<Value = U256> {
    strat_u256(Uintsize::Medium)
}

#[cfg(all(feature = "testing", not(target_arch = "wasm32")))]
pub fn strat_large_u256() -> impl proptest::prelude::Strategy<Value = U256> {
    strat_u256(Uintsize::Large)
}

#[cfg(all(feature = "testing", not(target_arch = "wasm32")))]
pub fn strat_fixed_bytes<const N: usize>() -> impl proptest::prelude::Strategy<Value = FixedBytes<N>>
{
    strat_fixed_bytes_sizeable::<N>(Uintsize::Large)
}

#[cfg(all(feature = "testing", not(target_arch = "wasm32")))]
pub fn strat_address() -> impl proptest::prelude::Strategy<Value = Address> {
    proptest::arbitrary::any::<[u8; 20]>().prop_map(Address::new)
}

#[cfg(all(feature = "testing", not(target_arch = "wasm32")))]
pub fn strat_address_not_empty() -> impl proptest::prelude::Strategy<Value = Address> {
    ([
        1..u8::MAX,
        0..u8::MAX,
        0..u8::MAX,
        0..u8::MAX,
        0..u8::MAX,
        0..u8::MAX,
        0..u8::MAX,
        0..u8::MAX,
        0..u8::MAX,
        0..u8::MAX,
        0..u8::MAX,
        0..u8::MAX,
        0..u8::MAX,
        0..u8::MAX,
        0..u8::MAX,
        0..u8::MAX,
        0..u8::MAX,
        0..u8::MAX,
        0..u8::MAX,
        0..u8::MAX,
    ])
    .prop_map(Address::new)
}

#[macro_export]
macro_rules! storage_set_fields {
    ($ty: ty, $i:ident, { $($field:ident),+ $(,)? }) => {
        {
            let mut c = unsafe { <$ty>::new($i, 0) };
            $(
                c.$field.set($field);
            )+
            c
        }
    };
}

#[macro_export]
macro_rules! interactions_clear_after {
    ( $($field:ident => $func:expr),+ $(,)? ) => {
        $(
            $crate::host::set_msg_sender($field);
            { $func };
            $crate::host::set_msg_sender($crate::testing_addrs::MSG_SENDER);
        )+;
        $crate::host::clear_storage();
    }
}
