#![cfg(all(
    feature = "trading-backend-amm",
    feature = "testing",
    not(target_arch = "wasm32")
))]

use stylus_sdk::alloy_primitives::{Address, FixedBytes, U256};

use lib9lives::{
    host, immutables::*, interactions_clear_after, should_spend_fusdc_sender,
    strat_storage_trading, testing_addrs::*, utils::*,
    decimal::share_u256_to_decimal
};

use rust_decimal::Decimal;

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
                    Decimal::from(100),
                    share_u256_to_decimal(c.amm_liquidity.get()).unwrap()
                );
            },
            // Ivan follows it up with a $1000 more.
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
                assert_eq!(U256::from(1100 * 1e6 as u64), c.amm_liquidity.get());
                assert_eq!(U256::from(1100 * 1e6 as u64), c.amm_shares.get(outcome_a));
                assert_eq!(U256::from(1100 * 1e6 as u64), c.amm_shares.get(outcome_b));
                assert_eq!(U256::from(5e11 as u64), c.amm_outcome_prices.get(outcome_a));
                assert_eq!(U256::from(5e11 as u64), c.amm_outcome_prices.get(outcome_b));
                assert_eq!(U256::from(1100e6 as u64), c.amm_user_liquidity_shares.get(msg_sender()));
            }
        }
    }
}
