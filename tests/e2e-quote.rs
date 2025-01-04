#![cfg(all(feature = "testing", not(target_arch = "wasm32")))]

use stylus_sdk::alloy_primitives::{fixed_bytes, Address, U256};

use lib9lives::{
    decimal::MAX_DECIMAL,
    error::Error,
    host,
    utils::{block_timestamp, msg_sender},
    testing_addrs,
};

use proptest::prelude::*;

proptest! {
    #[test]
    fn test_quote_1(
        fusdc_quote in 1..MAX_DECIMAL,
    ) {
        use lib9lives::storage_trading::StorageTrading;
        host::with_contract::<_, StorageTrading, _>(|c| {
            c.ctor(
                vec![
                    fixed_bytes!("0541d76af67ad076"),
                    fixed_bytes!("3be0d8814450a582"),
                ],
                Address::from([1_u8; 20]),
                block_timestamp() + 1,
                block_timestamp() + 2,
                msg_sender(), // Fee recipient.
                testing_addrs::SHARE, // Share impl.
                false
            )
            .unwrap();

            match c
                .quote_C_0_E_17_F_C_7(
                    fixed_bytes!("0541d76af67ad076"),
                    U256::from(fusdc_quote),
                ).into()
                {
                    Ok(_) => (),
                    Err(Error::CheckedMulOverflow) => (), // We assume this is fine.
                    err => {err.unwrap();}
                }
        })
    }
}
