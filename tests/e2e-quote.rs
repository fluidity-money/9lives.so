#![cfg(all(feature = "testing", not(target_arch = "wasm32")))]

use stylus_sdk::{
    alloy_primitives::{fixed_bytes, Address, U256},
    block,
};

use lib9lives::{decimal::MAX_DECIMAL, error::Error, host};

use stylus_sdk::msg;

use proptest::prelude::*;

proptest! {
    #[test]
    fn test_quote_1(
        seed_amount_1 in 1..MAX_DECIMAL,
        seed_amount_2 in 1..MAX_DECIMAL,
        fusdc_quote in 1..MAX_DECIMAL,
    ) {
        use lib9lives::storage_trading::StorageTrading;
        host::with_storage::<_, StorageTrading, _>(|c| {
            c.ctor(
                vec![
                    (fixed_bytes!("0541d76af67ad076"), U256::from(seed_amount_1)),
                    (fixed_bytes!("3be0d8814450a582"), U256::from(seed_amount_2)),
                ],
                Address::from([1_u8; 20]),
                block::timestamp() + 1,
                block::timestamp() + 2,
                msg::sender()
            )
            .unwrap();

            match c
                .quote_101_C_B_E_35(
                    fixed_bytes!("0541d76af67ad076"),
                    U256::from(fusdc_quote),
                    msg::sender(),
                ).into()
                {
                    Ok(_) => (),
                    Err(Error::CheckedMulOverflow) => (), // We assume this is fine.
                    err => {err.unwrap();}
                }
        })
    }
}
