#![cfg(feature = "testing")]

use proptest::prelude::*;

use stylus_sdk::alloy_primitives::{Address, FixedBytes, U256};

use lib9lives::host;

#[test]
fn test_factory_new_trading() {
    use lib9lives::factory_contract::Factory;
    host::with_storage::<_, Factory, _>(|c| {
        c.ctor(Address::ZERO).unwrap();
        let id = FixedBytes::<8>::from_slice(&[0x1e, 0x9e, 0x51, 0x83, 0x7f, 0x3e, 0xa6, 0xea]);
        let id2 = FixedBytes::<8>::from_slice(&[0x1f, 0x9e, 0x51, 0x83, 0x7f, 0x3e, 0xa6, 0xea]);
        c.new_trading(vec![(id, U256::from(1)), (id2, U256::from(2))])
            .unwrap();
    })
}

#[test]
fn test_trading_edge_1() {
    use lib9lives::trading_contract::Trading;
    host::with_storage::<_, Trading, _>(|c| {
        let outcome_1 =
            FixedBytes::<8>::from_slice(&[0x1e, 0x9e, 0x51, 0x83, 0x7f, 0x3e, 0xa6, 0xea]);
        let outcomes = [
            (outcome_1, U256::from(100000)),
            (
                FixedBytes::<8>::from_slice(&[0x1f, 0x9e, 0x51, 0x83, 0x7f, 0x3e, 0xa6, 0xea]),
                U256::from(4270954),
            ),
        ];
        c.ctor(Address::ZERO, Address::ZERO, outcomes.to_vec())
            .unwrap();
        assert_eq!(
            c.mint(outcome_1, U256::from(32699704752660_u64), Address::ZERO)
                .unwrap(),
            U256::ZERO
        );
    })
}

#[cfg(not(target_arch = "wasm32"))]
proptest! {
    #[test]
    fn test_trading_full_story(
        amount_0 in 1e5 as i64..9223372036854775807_i64,
        amount_1 in 1e5 as i64..9223372036854775807_i64,
        mint_amount in 1e5 as i64..9223372036854775807_i64,
    ) {
        use lib9lives::trading_contract::Trading;
        host::with_storage::<_, Trading, _>(|c| {
            let outcome_1 =
                FixedBytes::<8>::from_slice(&[0x1e, 0x9e, 0x51, 0x83, 0x7f, 0x3e, 0xa6, 0xea]);
            let outcomes = [
                (outcome_1, U256::from(amount_0)),
                (
                    FixedBytes::<8>::from_slice(&[0x1f, 0x9e, 0x51, 0x83, 0x7f, 0x3e, 0xa6, 0xea]),
                    U256::from(amount_1)
                ),
            ];
            c.ctor(Address::ZERO, Address::ZERO, outcomes.to_vec())
                .unwrap();
            let mint_amount = U256::from(mint_amount);
            c
                .mint(outcome_1, mint_amount, Address::ZERO)
                .unwrap();
        })
    }
}
