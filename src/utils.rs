#![doc(hidden)]

use stylus_sdk::alloy_primitives::Address;

#[allow(unused)]
use stylus_sdk::alloy_primitives::U256;

#[cfg(all(test, not(target_arch = "wasm32")))]
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

#[cfg(all(test, not(target_arch = "wasm32")))]
pub fn strat_u256() -> impl proptest::prelude::Strategy<Value = U256> {
    (0..32).prop_perturb(move |steps, mut rng| {
        U256::from_be_slice(
            (0..=steps)
                .map(|_| rng.gen())
                .collect::<arrayvec::ArrayVec<u8, 256>>()
                .as_slice(),
        )
    })
}

#[cfg(all(test, not(target_arch = "wasm32")))]
pub fn strat_address() -> impl proptest::prelude::Strategy<Value = Address> {
    proptest::arbitrary::any::<[u8; 20]>().prop_map(|x| Address::new(x))
}
