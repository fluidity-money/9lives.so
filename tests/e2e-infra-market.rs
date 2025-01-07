#![cfg(all(not(target_arch = "wasm32"), feature = "testing"))]

use proptest::prelude::*;

use stylus_sdk::alloy_primitives::{FixedBytes, U256};

use lib9lives::{
    error::{panic_guard, Error},
    fees::*,
    fusdc_call, give_then_reset_token,
    host::{set_block_timestamp, ts_add_time},
    interactions_clear_after, nineliveslockedarb_call, panic_guard_eq, proxy, should_points,
    should_spend_fusdc_contract, should_spend_fusdc_sender, should_spend_staked_arb,
    strat_storage_infra_market,
    testing_addrs::*,
    utils::{
        block_timestamp, msg_sender, strat_address_not_empty, strat_fixed_bytes, strat_large_u256,
    },
    InfraMarketState,
};

proptest! {
    #[test]
    fn test_infra_market_call_close_only_happy_path(
        trading_addr in strat_address_not_empty(),
        desc in strat_fixed_bytes::<32>(),
        call_deadline in block_timestamp()+151..100000,
        mut outcome_1 in strat_fixed_bytes::<8>(),
        mut c in strat_storage_infra_market()
    ) {
        // Simple situation, someone creates a infra market, and during its
        // optimistic stage someone calls it. It's not whinged at, and it calls
        // predict without issue. The caller gets their small amount.
        c.enabled.set(true);
        // Add 1 to the outcome_1 so that we don't have a 0 outcome.
        if outcome_1[0] == 0 {
            outcome_1[0] = 1;
        }
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
                    {
                        assert_eq!(
                            BOND_FOR_CALL,
                            c.call(trading_addr, outcome_1, msg_sender()).unwrap(),
                        );
                        Ok(())
                    }
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
        mut outcome_1 in strat_fixed_bytes::<8>(),
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
        // We add 1 to the outcome that we're going to whinge about, so that it
        // won't break for being 0.
        if outcome_1[0] == 0 {
            outcome_1[0] += 1;
        }
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
                    BOND_FOR_WHINGE + BOND_FOR_CALL + INCENTIVE_AMT_CLOSE + INCENTIVE_AMT_DECLARE,
                    {
                        c.declare(trading_addr, vec![outcome_1, outcome_2], IVAN).unwrap();
                        // Erik was correct, so he should receive the bond + incentive for calling.
                        assert_eq!(
                            BOND_FOR_WHINGE + BOND_FOR_CALL + INCENTIVE_AMT_CALL,
                            fusdc_call::balance_of(ERIK).unwrap()
                        );
                        // Ivan was incorrect, but he should still receive the declare + close amount.
                        assert_eq!(
                            INCENTIVE_AMT_DECLARE + INCENTIVE_AMT_CLOSE,
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

    #[test]
    fn test_whinge_predict_slash(
        trading_addr in strat_address_not_empty(),
        desc in strat_fixed_bytes::<32>(),
        call_deadline in block_timestamp()+100..100000,
        mut outcome_preferred_ivan in strat_fixed_bytes::<8>(),
        mut outcome_preferred_erik in strat_fixed_bytes::<8>(),
        outcome_garbage in proptest::collection::vec(strat_fixed_bytes::<8>(), 1..10),
        eli_amt in (5000 + 9000)..1000000,
        ogous_amt in 100..5000,
        paxia_amt in 500..9000,
        eli_seed in strat_large_u256(),
        ogous_seed in strat_large_u256(),
        paxia_seed in strat_large_u256(),
        mut c in strat_storage_infra_market()
    ) {
        // Create a infra market. Ivan calls it, Erik disputes it with a whinge,
        // Eli, Ogous, and Paxia commit. Eventually, they reveal themselves. In
        // the end, Ivan's preferred outcome wins, and finally, Erik declares it.
        // Eli bet correctly, so he takes money from Ogous and Paxia after Yoel
        // calls sweep on Ogous and Paxia by drawing down the pot.
        c.enabled.set(true);
        // Add one to the outcome identifiers for Erik and Ivan so they're not empty.
        if outcome_preferred_ivan[0] == 0 {
            outcome_preferred_ivan[0] = 1;
        }
        if outcome_preferred_erik[0] == 0 {
            outcome_preferred_erik[0] = 1;
        }
        c.locked_arb_token_addr.set(LOCKUP_TOKEN);
        c.factory_addr.set(IVAN);
        set_block_timestamp(0);
        let ogous_amt_fee = U256::from((ogous_amt as f64 * 0.02) as u64);
        let paxia_amt_fee = U256::from((paxia_amt as f64 * 0.02) as u64);
        let ogous_amt = U256::from(ogous_amt);
        let paxia_amt = U256::from(paxia_amt);
        let eli_amt = U256::from(eli_amt);
        let ogous_amt_no_fee = ogous_amt - ogous_amt_fee;
        let paxia_amt_no_fee = paxia_amt - paxia_amt_fee;
        interactions_clear_after! {
            IVAN => {
                // Ivan sets up the contract, creates the market, waits a little, then calls.
                should_spend_fusdc_sender!(
                    INCENTIVE_AMT_BASE,
                    c.register(trading_addr, IVAN, desc, block_timestamp() + 1, call_deadline)
                );
                ts_add_time(block_timestamp() + 10);
                assert_eq!(
                    { let c: u8 = InfraMarketState::Callable.into(); c },
                    c.status(trading_addr).unwrap().0
                );
                should_spend_fusdc_sender!(
                    BOND_FOR_CALL,
                    c.call(trading_addr, outcome_preferred_ivan, IVAN)
                );
            },
            ERIK => {
                // Erik disputes the call with a whinge. The first attempt should fail
                // since the check is that it's the same as the called outcome.
                assert_eq!(c.status(trading_addr).unwrap().0, InfraMarketState::Whinging.into());
                panic_guard_eq!(
                    c.whinge(trading_addr, outcome_preferred_ivan, ERIK),
                    Error::CantWhingeCalled
                );
                should_spend_fusdc_sender!(
                    BOND_FOR_WHINGE,
                    c.whinge(trading_addr, outcome_preferred_erik, ERIK)
                );
                assert_eq!(
                    { let c: u8 = InfraMarketState::Predicting.into(); c },
                    c.status(trading_addr).unwrap().0
                );
            },
            ELI => {
                // Eli commits his preference for Ivan's suggested outcome.
                give_then_reset_token!(LOCKUP_TOKEN, ELI, eli_amt, should_points!(
                    ELI,
                    eli_amt,
                    c.predict(trading_addr, proxy::create_identifier(&[
                        ELI.as_slice(),
                        outcome_preferred_ivan.as_slice(),
                        &eli_seed.to_be_bytes::<32>()
                    ]))
                ));
            },
            OGOUS => {
                // Ogous commits his preference for Erik's suggested outcome.
                give_then_reset_token!(LOCKUP_TOKEN, OGOUS, ogous_amt, should_points!(
                    OGOUS,
                    ogous_amt,
                    c.predict(trading_addr, proxy::create_identifier(&[
                        OGOUS.as_slice(),
                        outcome_preferred_erik.as_slice(),
                        &ogous_seed.to_be_bytes::<32>()
                    ]))
                ));
            },
            PAXIA => {
                // Paxia commits his preference for Erik's suggested outcome.
                give_then_reset_token!(LOCKUP_TOKEN, PAXIA, paxia_amt, should_points!(
                    PAXIA,
                    paxia_amt,
                    c.predict(trading_addr, proxy::create_identifier(&[
                        PAXIA.as_slice(),
                        outcome_preferred_erik.as_slice(),
                        &paxia_seed.to_be_bytes::<32>()
                    ]))
                ));
            },
            ELI => {
                // After waiting some time, it's needed to reveal the commitments. We wait 2 days.
                ts_add_time(24 * 60 * 60 * 2 + 1);
                assert_eq!(
                    { let c: u8 = InfraMarketState::Revealing.into(); c },
                    c.status(trading_addr).unwrap().0
                );
                give_then_reset_token!(LOCKUP_TOKEN, ELI, eli_amt, should_points!(ELI, eli_amt, c.reveal(
                    trading_addr,
                    ELI,
                    outcome_preferred_ivan,
                    eli_seed
                )));
            },
            OGOUS => {
                give_then_reset_token!(LOCKUP_TOKEN, OGOUS, ogous_amt, should_points!(OGOUS, ogous_amt, c.reveal(
                    trading_addr,
                    OGOUS,
                    outcome_preferred_erik,
                    ogous_seed
                )));
            },
            PAXIA => {
                give_then_reset_token!(LOCKUP_TOKEN, PAXIA, paxia_amt, should_points!(PAXIA, paxia_amt, c.reveal(
                    trading_addr,
                    PAXIA,
                    outcome_preferred_erik,
                    paxia_seed
                )));
            },
            ERIK => {
                // In submitting the outcomes, Erik submits a few garbage
                // outcomes. It should be that this won't matter.
                // First, Erik waits 2 days.
                ts_add_time(24 * 60 * 60 * 2 + 1);
                assert_eq!(
                    { let c: u8 = InfraMarketState::Declarable.into(); c },
                    c.status(trading_addr).unwrap().0,
                );
                let mut outcomes = outcome_garbage.clone();
                outcomes.push(outcome_preferred_ivan);
                outcomes.push(outcome_preferred_erik);
                should_spend_fusdc_contract!(
                    BOND_FOR_WHINGE +
                    BOND_FOR_CALL +
                    INCENTIVE_AMT_CLOSE +
                    INCENTIVE_AMT_DECLARE +
                    INCENTIVE_AMT_CALL,
                    {
                        let erik_incentive_amt =
                            INCENTIVE_AMT_DECLARE + INCENTIVE_AMT_CLOSE;
                        // Ivan (the caller) was correct, so he should receive the bond for calling and
                        // calling incentive amount.
                        assert_eq!(
                            erik_incentive_amt,
                            c.declare(trading_addr, outcomes, ERIK).unwrap()
                        );
                        assert_eq!(
                            BOND_FOR_WHINGE + BOND_FOR_CALL + INCENTIVE_AMT_CALL,
                            fusdc_call::balance_of(IVAN).unwrap()
                        );
                        // Erik (the whinger) was incorrect, but he should receive the close and
                        // declare incentive.
                        assert_eq!(
                            erik_incentive_amt,
                            fusdc_call::balance_of(ERIK).unwrap()
                        );
                        Ok(())
                    }
                );
                assert_eq!(
                    { let c: u8 = InfraMarketState::Sweeping.into(); c },
                    c.status(trading_addr).unwrap().0,
                );
            },
            YOEL => {
                // Yoel calls sweep on Ogous and Paxia, and collects some compensation
                // for doing so.
                should_spend_staked_arb!(
                    // We also set this here so that Yoel and the lockup contract are reset after.
                    { LOCKUP_CONTRACT => ogous_amt, YOEL => U256::ZERO },
                    {
                        assert_eq!(
                            ogous_amt_fee,
                            c.sweep(trading_addr, U256::ZERO, OGOUS, YOEL).unwrap()
                        );
                        assert_eq!(
                            U256::ZERO,
                            nineliveslockedarb_call::balance_of(STAKED_ARB, LOCKUP_CONTRACT).unwrap()
                        );
                        assert_eq!(
                            ogous_amt_fee,
                            nineliveslockedarb_call::balance_of(STAKED_ARB, YOEL).unwrap()
                        );
                        Ok(())
                    }
                );
                should_spend_staked_arb!(
                    { LOCKUP_CONTRACT => paxia_amt, YOEL => U256::ZERO },
                    {
                        c.sweep(trading_addr, U256::ZERO, PAXIA, YOEL).unwrap();
                        assert_eq!(
                            U256::ZERO,
                            nineliveslockedarb_call::balance_of(STAKED_ARB, LOCKUP_CONTRACT).unwrap()
                        );
                        assert_eq!(
                            paxia_amt_fee,
                            nineliveslockedarb_call::balance_of(STAKED_ARB, YOEL).unwrap()
                        );
                        Ok(())
                    }
                );
            },
            ELI => {
                // Eli now draws down the pot.
                should_spend_staked_arb!(
                    { LOCKUP_CONTRACT => ogous_amt_no_fee + paxia_amt_no_fee, YOEL => U256::ZERO },
                    {
                        c.capture(trading_addr, U256::ZERO, ELI).unwrap();
                        assert_eq!(
                            ogous_amt_no_fee + paxia_amt_no_fee,
                            nineliveslockedarb_call::balance_of(STAKED_ARB, LOCKUP_CONTRACT).unwrap()
                        );
                        Ok(())
                    }
                );
            }
        }
    }
}
