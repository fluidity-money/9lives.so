#![cfg(all(feature = "testing", not(target_arch = "wasm32")))]

use alloy_primitives::{fixed_bytes, Address, U256};

use lib9lives::host;

use stylus_sdk::msg;

use proptest::prelude::*;

proptest! {
    #[test]
    fn test_quote_1(
        seed_amount_1 in 1..u128::MAX,
        seed_amount_2 in 1..u128::MAX,
        fusdc_quote in 1..u128::MAX,
    ) {
        use lib9lives::trading_storage::StorageTrading;
        host::with_storage::<_, StorageTrading, _>(|c| {
            c.ctor(
                Address::from([1_u8; 20]),
                vec![
                    (fixed_bytes!("0541d76af67ad076"), U256::from(seed_amount_1)),
                    (fixed_bytes!("3be0d8814450a582"), U256::from(seed_amount_2)),
                ],
            )
            .unwrap();

            c
                .quote_101_C_B_E_35(
                    fixed_bytes!("0541d76af67ad076"),
                    U256::from(fusdc_quote),
                    msg::sender(),
                )
                .unwrap();
        })
    }
}
