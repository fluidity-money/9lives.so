#![cfg(all(feature = "testing", not(target_arch = "wasm32")))]

use stylus_sdk::alloy_primitives::{Address, FixedBytes, U256};

use lib9lives::{
    host,
    should_spend,
    utils::{block_timestamp, msg_sender},
    immutables::FUSDC_ADDR
};

#[test]
fn test_factory_new_trading() {
    use lib9lives::storage_factory::StorageFactory;
    host::with_contract::<_, StorageFactory, _>(|c| {
        c.enabled.set(true);
        let id = FixedBytes::<8>::from_slice(&[0x1e, 0x9e, 0x51, 0x83, 0x7f, 0x3e, 0xa6, 0xea]);
        let id2 = FixedBytes::<8>::from_slice(&[0x1f, 0x9e, 0x51, 0x83, 0x7f, 0x3e, 0xa6, 0xea]);
        let setup_cost = U256::from(1e6 as u64 * 5);
        should_spend!(
            FUSDC_ADDR,
            {msg_sender() => setup_cost},
            c.new_trading_90_C_25562(
                vec![
                    (id, U256::from(1e6), String::new()),
                    (id2, U256::from(1e6), String::new()),
                ],
                msg_sender(), // This is needed to have the same as the infra market until our scaffolding is better.
                block_timestamp(),
                block_timestamp() + 100,
                FixedBytes::ZERO,
                Address::ZERO,
                0,
                0,
                0,
            )
        );
    })
}

/*
#[test]
fn test_unit_1() {
    use lib9lives::storage_trading::StorageTrading;
    host::with_contract::<_, StorageTrading, _>(|c| {
        let outcome_0 =
            FixedBytes::<8>::from_slice(&[0x1e, 0x9e, 0x51, 0x83, 0x7f, 0x3e, 0xa6, 0xea]);
        let outcome_1 =
            FixedBytes::<8>::from_slice(&[0x1f, 0x9e, 0x51, 0x83, 0x7f, 0x3e, 0xa6, 0xea]);
        let amount_0 = U256::from(1000000);
        let amount_1 = U256::from(1000000);
        let mint_amount = U256::from(10000000);
        let outcomes = [outcome_0, outcome_1];
        c.ctor(
            outcomes.to_vec(),
            Address::ZERO,
            block_timestamp() + 1,
            block_timestamp() + 2,
            Address::ZERO,
            Address::ZERO,
            false,
        )
        .unwrap();
        dbg!(c.mint_test(outcome_1, mint_amount, Address::ZERO).unwrap());
    })
}
*/

/*
proptest! {
    #[test]
    fn test_trading_full_story(
        amount_0 in 1e6 as i64..1000000000000000_i64,
        amount_1 in 1e6 as i64..1000000000000000_i64,
        mint_amount in 1e6 as i64..1000000000000000_i64
    ) {
        let amount_0 = U256::from(amount_0);
        let amount_1 = U256::from(amount_1);
        let mint_amount = U256::from(mint_amount);
        use lib9lives::storage_trading::StorageTrading;
        host::with_contract::<_, StorageTrading, _>(|c| {
            let outcome_0 =
                FixedBytes::<8>::from_slice(&[0x1e, 0x9e, 0x51, 0x83, 0x7f, 0x3e, 0xa6, 0xea]);
            let outcome_1 = FixedBytes::<8>::from_slice(&[0x1f, 0x9e, 0x51, 0x83, 0x7f, 0x3e, 0xa6, 0xea]);
            let outcomes = [outcome_0, outcome_1];
            c.ctor(
                outcomes.to_vec(),
                Address::ZERO,
                block_timestamp(),
                block_timestamp() + 100, msg_sender(),
                Address::ZERO,
                false
            )
                .unwrap();
            c
                .mint_test(outcome_1, mint_amount, Address::ZERO)
                .unwrap();
        })
    }
}
*/