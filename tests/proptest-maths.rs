#![cfg(all(feature = "testing", not(target_arch = "wasm32")))]

use proptest::prelude::*;

use stylus_sdk::alloy_primitives::U256;

use lib9lives::maths;

#[test]
fn test_price_to_sqrt_ratio_native() {
    assert_eq!(
        maths::price_to_sqrt_price(U256::from(1)).unwrap(),
        U256::from(79228162514264337593543950336_u128)
    )
}

proptest! {
    #[test]
    fn test_price_to_sqrt_ratio(price in 2 ^ -256..2 ^ 256) {
         prop_assume!(price > 0);
         let price = U256::from(price);
         maths::price_to_sqrt_price(price).unwrap();
    }
}
