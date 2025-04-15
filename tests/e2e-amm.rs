#![cfg(all(
    feature = "trading-backend-amm",
    feature = "testing",
    not(target_arch = "wasm32")
))]

use stylus_sdk::alloy_primitives::{Address, FixedBytes, U256};

use lib9lives::{
    assert_eq_u_down, host, immutables::*, interactions_clear_after,
    should_spend_fusdc_sender, strat_storage_trading, testing_addrs::*, utils::*,
};

use proptest::prelude::*;

proptest! {
    #[test]
    fn test_amm_user_story_1(
        outcome_a in strat_fixed_bytes::<8>(),
        outcome_b in strat_fixed_bytes::<8>(),
        mut c in strat_storage_trading(false)
    ) {
        // A binary outcome market example. Let's follow the scenario in
        // simulate_market_1.
        let outcomes = vec![outcome_a, outcome_b];
        c.created.set(false);
        c.ctor(
            outcomes.clone(),
            msg_sender(),
            block_timestamp() + 1,
            block_timestamp() + 2,
            DAO_ADDR,
            SHARE,
            false,
            0,
            0,
            0,
        )
        .unwrap();
        c.amm_liquidity.set(U256::ZERO);
        interactions_clear_after! {
            // Ivan goes to add $100 worth of liquidity...
            IVAN => {
                let liquidity_amt = U256::from(100e6 as u64);
                should_spend_fusdc_sender!(
                    liquidity_amt,
                    c.add_liquidity_permit(
                        liquidity_amt,
                        IVAN,
                        U256::ZERO,
                        0,
                        FixedBytes::<32>::ZERO,
                        FixedBytes::<32>::ZERO
                    )
                );
                assert_eq!(
                    U256::from(100e6 as u64),
                    c.amm_liquidity.get()
                );
                let liquidity_amt = U256::from(1000e6 as u64);
                should_spend_fusdc_sender!(
                    liquidity_amt,
                    c.add_liquidity_permit(
                        liquidity_amt,
                        IVAN,
                        U256::ZERO,
                        0,
                        FixedBytes::<32>::ZERO,
                        FixedBytes::<32>::ZERO
                    )
                );
                assert_eq_u_down!(U256::from(1100 * 1e6 as u64), c.amm_liquidity.get());
                assert_eq_u_down!(U256::from(1100 * 1e6 as u64), c.amm_shares.get(outcome_a));
                assert_eq_u_down!(U256::from(1100 * 1e6 as u64), c.amm_shares.get(outcome_b));
                assert_eq_u_down!(U256::from(5e11 as u64), c.amm_outcome_prices.get(outcome_a));
                assert_eq_u_down!(U256::from(5e11 as u64), c.amm_outcome_prices.get(outcome_b));
                assert_eq_u_down!(
                    U256::from(1100e6 as u64),
                    c.amm_user_liquidity_shares.get(msg_sender())
                );
            },
        }
    }

    #[test]
    fn test_amm_user_story_2(
        outcome_a in strat_fixed_bytes::<8>(),
        outcome_b in strat_fixed_bytes::<8>(),
        mut c in strat_storage_trading(false)
    ) {
        // simulate_market_2 translation:
        let outcomes = vec![outcome_a, outcome_b];
        c.created.set(false);
        c.ctor(
            outcomes.clone(),
            msg_sender(),
            block_timestamp() + 1,
            block_timestamp() + 2,
            DAO_ADDR,
            SHARE,
            false,
            0,
            0,
            0,
        )
        .unwrap();
        c.test_set_outcome_shares(1100e6 as u64, &[
            (outcome_a, 861170000),  //861.17,
            (outcome_b, 1405070000), //1405.07
        ]);
        interactions_clear_after! {
            IVAN => {
                let liquidity_amt = U256::from(1000e6 as u64);
                should_spend_fusdc_sender!(
                    liquidity_amt,
                    c.add_liquidity_permit(
                        liquidity_amt,
                        IVAN,
                        U256::ZERO,
                        0,
                        FixedBytes::<32>::ZERO,
                        FixedBytes::<32>::ZERO
                    )
                );
                assert_eq_u_down!(U256::from(1882880000u64), c.amm_liquidity.get());
                assert_eq_u_down!(
                    U256::from(1474070000u64),
                    c.amm_shares.get(outcome_a)
                );
                assert_eq_u_down!(
                    U256::from(2405070000u64),
                    c.amm_shares.get(outcome_b)
                );
                assert_eq_u_down!(
                    U256::from(620000000000u64),
                    c.amm_outcome_prices.get(outcome_a)
                );
                assert_eq_u_down!(
                    U256::from(380000000000u64),
                    c.amm_outcome_prices.get(outcome_b)
                );
                assert_eq_u_down!(
                    U256::from(782880000000000u64),
                    c.amm_user_liquidity_shares.get(msg_sender())
                );
            },
        }
    }

    #[test]
    fn test_amm_user_story_3(
        outcome_a in strat_fixed_bytes::<8>(),
        outcome_b in strat_fixed_bytes::<8>(),
        outcome_c in strat_fixed_bytes::<8>(),
        outcome_d in strat_fixed_bytes::<8>(),
        mut c in strat_storage_trading(false)
    ) {
        // simulate_market_3 translation:
        let outcomes = vec![outcome_a, outcome_b];
        c.created.set(false);
        c.ctor(
            outcomes.clone(),
            msg_sender(),
            block_timestamp() + 1,
            block_timestamp() + 2,
            DAO_ADDR,
            SHARE,
            false,
            0,
            0,
            0,
        )
        .unwrap();
        c.test_set_outcome_shares(1000e6 as u64, &[
            (outcome_a, 461530000000000),  //461.53
            (outcome_b, 1294000000000000), //1294
            (outcome_c, 1294000000000000), //1294
            (outcome_d, 1294000000000000), //1294
        ]);
        interactions_clear_after! {
            IVAN => {
                let liquidity_amt = U256::from(1000e6 as u64);
                should_spend_fusdc_sender!(
                    liquidity_amt,
                    c.add_liquidity_permit(
                        liquidity_amt,
                        IVAN,
                        U256::ZERO,
                        0,
                        FixedBytes::<32>::ZERO,
                        FixedBytes::<32>::ZERO
                    )
                );
                assert_eq_u_down!(
                    U256::from(1769680000000000u64),
                    c.amm_liquidity.get()
                );
            },
        }
    }
}
