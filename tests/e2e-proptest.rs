#![cfg(all(feature = "testing", not(target_arch = "wasm32")))]

use proptest::prelude::*;

use stylus_sdk::alloy_primitives::{Address, FixedBytes, U256};

use lib9lives::host;

#[test]
fn test_factory_new_trading() {
    use lib9lives::factory_storage::StorageFactory;
    host::with_storage::<_, StorageFactory, _>(|c| {
        c.ctor(Address::ZERO).unwrap();
        let id = FixedBytes::<8>::from_slice(&[0x1e, 0x9e, 0x51, 0x83, 0x7f, 0x3e, 0xa6, 0xea]);
        let id2 = FixedBytes::<8>::from_slice(&[0x1f, 0x9e, 0x51, 0x83, 0x7f, 0x3e, 0xa6, 0xea]);
        c.new_trading_C_11_A_A_A_3_B(vec![(id, U256::from(1e6)), (id2, U256::from(1e6))])
            .unwrap();
    })
}

#[test]
fn test_trading_edgecase() {
    let amount_0 = U256::from(23560214097017_u64);
    let amount_1 = U256::from(1000000_u64);
    let mint_amount = U256::from(64682966_u64);
    use lib9lives::trading_storage::StorageTradingDPM;
    host::with_storage::<_, StorageTradingDPM, _>(|c| {
        let outcome_0 =
            FixedBytes::<8>::from_slice(&[0x1e, 0x9e, 0x51, 0x83, 0x7f, 0x3e, 0xa6, 0xea]);
        let outcome_1 =
            FixedBytes::<8>::from_slice(&[0x1f, 0x9e, 0x51, 0x83, 0x7f, 0x3e, 0xa6, 0xea]);
        let outcomes = [(outcome_0, amount_0), (outcome_1, amount_1)];
        c.ctor(Address::ZERO, outcomes.to_vec()).unwrap();
        c.mint_227_C_F_432(outcome_1, mint_amount, Address::ZERO)
            .unwrap();
    })
}

#[test]
fn test_unit_1() {
    use lib9lives::trading_storage::StorageTradingDPM;
    host::with_storage::<_, StorageTradingDPM, _>(|c| {
        let outcome_0 =
            FixedBytes::<8>::from_slice(&[0x1e, 0x9e, 0x51, 0x83, 0x7f, 0x3e, 0xa6, 0xea]);
        let outcome_1 =
            FixedBytes::<8>::from_slice(&[0x1f, 0x9e, 0x51, 0x83, 0x7f, 0x3e, 0xa6, 0xea]);
        let amount_0 = U256::from(1000000);
        let amount_1 = U256::from(1000000);
        let mint_amount = U256::from(10000000);
        let outcomes = [(outcome_0, amount_0), (outcome_1, amount_1)];
        c.ctor(Address::ZERO, outcomes.to_vec()).unwrap();
        dbg!(c
            .mint_227_C_F_432(outcome_1, mint_amount, Address::ZERO)
            .unwrap());
    })
}

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
        use lib9lives::trading_storage::StorageTradingDPM;
        host::with_storage::<_, StorageTradingDPM, _>(|c| {
            let outcome_0 =
                FixedBytes::<8>::from_slice(&[0x1e, 0x9e, 0x51, 0x83, 0x7f, 0x3e, 0xa6, 0xea]);
            let outcome_1 = FixedBytes::<8>::from_slice(&[0x1f, 0x9e, 0x51, 0x83, 0x7f, 0x3e, 0xa6, 0xea]);
            let outcomes = [
                (outcome_0, amount_0),
                (outcome_1, amount_1),
            ];
            c.ctor(Address::ZERO, outcomes.to_vec())
                .unwrap();
            c
                .mint_227_C_F_432(outcome_1, mint_amount, Address::ZERO)
                .unwrap();
        })
    }
}
