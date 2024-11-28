#![cfg(all(feature = "testing", not(target_arch = "wasm32")))]

use proptest::prelude::*;

use stylus_sdk::{
    alloy_primitives::{Address, FixedBytes, U256},
    block, msg,
};

use lib9lives::host;

#[test]
fn test_factory_new_trading() {
    use lib9lives::storage_factory::StorageFactory;
    host::with_storage::<_, StorageFactory, _>(|c| {
        c.ctor(Address::ZERO, Address::ZERO, Address::ZERO, Address::ZERO)
            .unwrap();
        let id = FixedBytes::<8>::from_slice(&[0x1e, 0x9e, 0x51, 0x83, 0x7f, 0x3e, 0xa6, 0xea]);
        let id2 = FixedBytes::<8>::from_slice(&[0x1f, 0x9e, 0x51, 0x83, 0x7f, 0x3e, 0xa6, 0xea]);
        c.new_trading_37_B_D_1242(
            vec![
                (id, U256::from(1e6), String::new()),
                (id2, U256::from(1e6), String::new()),
            ],
            Address::from([1_u8; 20]),
            true,
            block::timestamp(),
            block::timestamp() + 100,
            FixedBytes::ZERO,
            Address::ZERO,
        )
        .unwrap();
    })
}

#[test]
fn test_trading_edgecase() {
    let amount_0 = U256::from(23560214097017_u64);
    let amount_1 = U256::from(1000000_u64);
    let mint_amount = U256::from(64682966_u64);
    use lib9lives::storage_trading::StorageTrading;
    host::with_storage::<_, StorageTrading, _>(|c| {
        let outcome_0 =
            FixedBytes::<8>::from_slice(&[0x1e, 0x9e, 0x51, 0x83, 0x7f, 0x3e, 0xa6, 0xea]);
        let outcome_1 =
            FixedBytes::<8>::from_slice(&[0x1f, 0x9e, 0x51, 0x83, 0x7f, 0x3e, 0xa6, 0xea]);
        let outcomes = [(outcome_0, amount_0), (outcome_1, amount_1)];
        c.ctor(
            outcomes.to_vec(),
            Address::ZERO,
            block::timestamp() + 1,
            block::timestamp() + 2,
            msg::sender(),
        )
        .unwrap();
        c.mint_227_C_F_432(outcome_1, mint_amount, Address::ZERO)
            .unwrap();
    })
}

#[test]
fn test_unit_1() {
    use lib9lives::storage_trading::StorageTrading;
    host::with_storage::<_, StorageTrading, _>(|c| {
        let outcome_0 =
            FixedBytes::<8>::from_slice(&[0x1e, 0x9e, 0x51, 0x83, 0x7f, 0x3e, 0xa6, 0xea]);
        let outcome_1 =
            FixedBytes::<8>::from_slice(&[0x1f, 0x9e, 0x51, 0x83, 0x7f, 0x3e, 0xa6, 0xea]);
        let amount_0 = U256::from(1000000);
        let amount_1 = U256::from(1000000);
        let mint_amount = U256::from(10000000);
        let outcomes = [(outcome_0, amount_0), (outcome_1, amount_1)];
        c.ctor(
            outcomes.to_vec(),
            Address::ZERO,
            block::timestamp() + 1,
            block::timestamp() + 2,
            Address::ZERO,
        )
        .unwrap();
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
        use lib9lives::storage_trading::StorageTrading;
        host::with_storage::<_, StorageTrading, _>(|c| {
            let outcome_0 =
                FixedBytes::<8>::from_slice(&[0x1e, 0x9e, 0x51, 0x83, 0x7f, 0x3e, 0xa6, 0xea]);
            let outcome_1 = FixedBytes::<8>::from_slice(&[0x1f, 0x9e, 0x51, 0x83, 0x7f, 0x3e, 0xa6, 0xea]);
            let outcomes = [
                (outcome_0, amount_0),
                (outcome_1, amount_1),
            ];
            c.ctor(
                outcomes.to_vec(),
                Address::ZERO,
                block::timestamp(),
                block::timestamp() + 100, msg::sender()
            )
                .unwrap();
            c
                .mint_227_C_F_432(outcome_1, mint_amount, Address::ZERO)
                .unwrap();
        })
    }
}
