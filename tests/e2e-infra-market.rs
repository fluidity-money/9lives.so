#![cfg(all(not(target_arch = "wasm32"), feature = "testing"))]

use proptest::prelude::*;

use stylus_sdk::alloy_primitives::{fixed_bytes, Address, FixedBytes, U256};

use lib9lives::{
    error::{panic_guard, Error},
    fees::*,
    host::{set_block_timestamp, ts_add_time, with_contract},
    immutables::FUSDC_ADDR,
    interactions_clear_after, panic_guard_eq, should_spend, should_spend_fusdc_contract,
    should_spend_fusdc_sender, strat_storage_infra_market,
    testing_addrs::*,
    fusdc_call,
    utils::{block_timestamp, msg_sender, strat_address_not_empty, strat_fixed_bytes},
};

proptest! {
    #[test]
    fn test_infra_market_call_close_only_happy_path(
        trading_addr in strat_address_not_empty(),
        desc in strat_fixed_bytes::<32>(),
        call_deadline in block_timestamp()+100..100000,
        outcome_1 in strat_fixed_bytes::<8>(),
        outcome_2 in strat_fixed_bytes::<8>(),
        mut c in strat_storage_infra_market()
    ) {
        // Simple situation, someone creates a infra market, and during its
        // optimistic stage someone calls it. It's not whinged at, and it calls
        // predict without issue. The caller gets their small amount.
        c.enabled.set(true);
        c.factory_addr.set(IVAN);
        set_block_timestamp(0);
        // Interactions should handle teardown for us.
        interactions_clear_after! {
            IVAN => {
                should_spend_fusdc_sender!(
                    INCENTIVE_AMT_BASE,
                    c.register(trading_addr, IVAN, desc, block_timestamp() + 1, call_deadline)
                );
                ts_add_time(block_timestamp() + 150);
                should_spend_fusdc_sender!(
                    BOND_FOR_CALL,
                    c.call(trading_addr, outcome_1, msg_sender())
                );
            },
            ERIK => {
                panic_guard(|| {
                    // Now we wait the period. Let's try to call different things
                    // while this is happening that shouldn't run otherwise.
                    // We should not be able to call call again:
                    assert_eq!(
                        c.call(trading_addr, outcome_1, msg_sender()).unwrap_err(),
                        Error::CampaignAlreadyCalled
                    );
                    // We should not be able to call predict yet:
                    assert_eq!(
                        c.predict(trading_addr, FixedBytes::<32>::ZERO).unwrap_err(),
                        Error::WhingedTimeUnset
                    );
                    // We should not be able to call sweep yet:
                    assert_eq!(
                        c.sweep(trading_addr, U256::ZERO, IVAN, msg_sender())
                            .unwrap_err(),
                        Error::WhingedTimeUnset
                    );
                    // We should not be able to call close yet:
                    assert_eq!(
                        c.close(trading_addr, msg_sender()).unwrap_err(),
                        Error::NotAfterWhinging
                    );
                });
            }
        }
    }

    #[test]
    fn test_unhappy_call_whinge_claim_no_bettors_path(
        trading_addr in strat_address_not_empty(),
        desc in strat_fixed_bytes::<32>(),
        call_deadline in block_timestamp()+100..100000,
        outcome_1 in strat_fixed_bytes::<8>(),
        outcome_2 in strat_fixed_bytes::<8>(),
        mut c in strat_storage_infra_market()
    ) {
        // In this situation, someone calls the call code, but unfortunately,
        // someone whinges about it. During the 7 day period that follows, NO-ONE
        // predicts using the contract, strangely enough. This should entitle someone
        // to call the declare function.
        c.enabled.set(true);
        c.factory_addr.set(IVAN);
        set_block_timestamp(0);
        // Interactions should handle teardown for us.
        interactions_clear_after! {
            IVAN => {
                // Ivan sets up the contract, creates the market, waits a little, then calls.
                should_spend_fusdc_sender!(
                    INCENTIVE_AMT_BASE,
                    c.register(trading_addr, IVAN, desc, block_timestamp() + 1, call_deadline)
                );
                // Since we haven't waited the amount of time before we can call,
                // this should refuse to be used.
                panic_guard_eq!(
                    c.call(trading_addr, outcome_1, msg_sender()),
                    Error::NotInsideCallingPeriod
                );
                ts_add_time(block_timestamp() + 10);
                should_spend_fusdc_sender!(
                    BOND_FOR_CALL,
                    c.call(trading_addr, outcome_2, IVAN)
                );
            },
            ERIK => {
                // Erik sees that no-one has predicted, and he calls whinge.
                should_spend_fusdc_sender!(
                    BOND_FOR_WHINGE,
                    c.whinge(trading_addr, outcome_1, ERIK)
                );
                // And he waits the amount of time for four days to go by.
                ts_add_time(60 * 60 * 24 * 4 + 1);
            },
            IVAN => {
                // Ivan finally goes to call declare, and in doing so, sees his amount
                // go to Erik.
                should_spend_fusdc_contract!(
                    BOND_FOR_WHINGE + BOND_FOR_CALL + INCENTIVE_AMT_DECLARE,
                    {
                        c.declare(trading_addr, vec![outcome_1, outcome_2], IVAN).unwrap();
                        // Erik was correct, so he should receive the bond for calling.
                        assert_eq!(
                            BOND_FOR_WHINGE + BOND_FOR_CALL,
                            fusdc_call::balance_of(ERIK).unwrap()
                        );
                        // Ivan was incorrect, but he should still receive the declare amount.
                        assert_eq!(
                            INCENTIVE_AMT_DECLARE,
                            fusdc_call::balance_of(IVAN).unwrap()
                        );
                        Ok(())
                    }
                );
                panic_guard_eq!(
                    c.declare(trading_addr, vec![outcome_1, outcome_2], IVAN),
                    Error::CampaignWinnerSet
                )
            }
        }
    }
}
