#![doc(hidden)]

use stylus_sdk::alloy_primitives::Address;

// We need these for our testing helper functions.
#[allow(unused)]
use stylus_sdk::alloy_primitives::{FixedBytes, U256};

#[cfg(all(feature = "testing", not(target_arch = "wasm32")))]
use proptest::prelude::*;

pub fn block_timestamp() -> u64 {
    #[cfg(all(feature = "testing", not(target_arch = "wasm32")))]
    return crate::host::block_timestamp();
    #[allow(unreachable_code)]
    stylus_sdk::block::timestamp()
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

// Get a purely random u256, only useful for storage offsets.
#[cfg(all(feature = "testing", not(target_arch = "wasm32")))]
pub fn rand_u256() -> U256 {
    let mut x: [u8; 32] = [0u8; 32];
    getrandom::getrandom(&mut x).unwrap();
    U256::from_le_bytes(x)
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
    proptest::arbitrary::any::<[u8; 20]>().prop_map(|x| Address::new(x))
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
    .prop_map(|x| Address::new(x))
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
