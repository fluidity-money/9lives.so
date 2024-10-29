#![cfg(all(feature = "testing", not(target_arch = "wasm32")))]

use proptest::prelude::*;

use stylus_sdk::alloy_primitives::U256;

use lib9lives::{
    decimal::{fusdc_u256_to_decimal, MAX_DECIMAL},
    maths,
};

#[test]
fn test_price_to_sqrt_ratio_native() {
    assert_eq!(
        maths::price_to_sqrt_price(U256::from(1)).unwrap(),
        U256::from(79228162514264337593543950336_u128)
    )
}

fn strat_valid_u256() -> impl Strategy<Value = U256> {
    (1..MAX_DECIMAL).prop_map(|x| U256::from(x) * U256::from(1e6))
}

#[ignore]
// TODO 340282366920938463463374607431768211456_u128
proptest! {
    #[test]
    fn test_price_to_sqrt_ratio_and_convert(p in 1_u128..100) {
        fusdc_u256_to_decimal(maths::price_to_sqrt_price(U256::from(p)).unwrap()).unwrap();
    }
}
