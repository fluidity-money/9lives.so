#![cfg(all(feature = "testing", not(target_arch = "wasm32")))]

use proptest::prelude::*;

use stylus_sdk::alloy_primitives::U256;

use lib9lives::{decimal, maths};

#[test]
fn test_price_to_sqrt_ratio_native() {
    assert_eq!(
        maths::price_to_sqrt_price(U256::from(1)).unwrap(),
        U256::from(79228162514264337593543950336_u128)
    )
}

proptest! {
    #[test]
    fn test_price_to_sqrt_ratio_and_convert(price in 0..2 ^ 256) {
         let price = U256::from(price);
         dbg!(
             price,
             maths::price_to_sqrt_price(price).unwrap(),
             decimal::fusdc_u256_to_decimal(maths::price_to_sqrt_price(price).unwrap()).unwrap()
         );
    }
}
