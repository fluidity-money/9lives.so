#![cfg(all(not(target_arch = "wasm32"), feature = "testing"))]

use proptest::prelude::*;

use stylus_sdk::alloy_primitives::{fixed_bytes, Address, FixedBytes, U256};

use arrayvec::ArrayVec;

use lib9lives::{
    error::{panic_guard, Error},
    fees::*,
    host::{set_msg_sender, ts_add_time, with_contract},
    immutables::FUSDC_ADDR,
    should_spend,
    utils::{block_timestamp, msg_sender},
    StorageInfraMarket,
};

#[test]
fn test_infra_market_call_close_only_happy_path() {
    // Simple situation, someone creates a infra market, and during its
    // optimistic stage someone calls it. It's not whinged at, and it calls
    // predict without issue. The caller gets their small amount.
    use lib9lives::storage_infra_market::StorageInfraMarket;
    with_contract::<_, StorageInfraMarket, _>(|c| {
        c.enabled.set(true);
        set_msg_sender(Address::from([9u8; 20]));
        c.factory_addr.set(msg_sender());
        let trading = Address::from([1u8; 20]);
        let winner = fixed_bytes!("0541d76af67ad076");
        assert_eq!(
            should_spend!(
                FUSDC_ADDR,
                {msg_sender() => INCENTIVE_AMT_BASE},
                c.register(
                    trading,
                    msg_sender(),
                    FixedBytes::<32>::from([1u8; 32]),
                    block_timestamp() + 100,
                    u64::MAX
                )
            ),
            INCENTIVE_AMT_BASE,
        );
        ts_add_time(150);
        c.call(trading, winner, msg_sender()).unwrap();
        // We're currently in day 1, the WHINGING PERIOD. This should
        // last for 2 days.
        // Prevent us from indisciminantly panicking (and unwinding) so we can check
        // the return statuses here.
        panic_guard(|| {
            // Now we wait the period. Let's try to call different things
            // while this is happening that shouldn't run otherwise.
            // We should not be able to call call again:
            assert_eq!(
                c.call(trading, winner, msg_sender()).unwrap_err(),
                Error::CampaignAlreadyCalled
            );
            // We should not be able to call predict yet:
            assert_eq!(
                c.predict(trading, FixedBytes::<32>::ZERO).unwrap_err(),
                Error::WhingedTimeUnset
            );
            // We should not be able to call sweep yet:
            assert_eq!(
                c.sweep(trading, msg_sender(), vec![], msg_sender(), msg_sender())
                    .unwrap_err(),
                Error::WhingedTimeUnset
            );
            // We should not be able to call close yet:
            assert_eq!(
                c.close(trading, msg_sender()).unwrap_err(),
                Error::NotAfterWhinging
            );
        });
        let two_days = 172800;
        ts_add_time(two_days + 10);
        // No-one called claim! It's time for us to call close.
        assert_eq!(c.close(trading, msg_sender()).unwrap(), INCENTIVE_AMT_CLOSE);
        // Let's confirm that the winner was set correctly.
        assert_eq!(c.winner(trading).unwrap(), winner);
    })
}

#[test]
fn test_unhappy_call_whinge_claim_no_bettors_path() {
    // In this situation, someone calls the call code, but unfortunately,
    // someone whinges about it. During the 7 day period that follows, NO-ONE
    // predicts using the contract, strangely enough. This should entitle someone
    // to call the sweep function, but only to discover that there is no-one to claim.
    // If that's the case, they should be able to submit the zero address, and collect
    // a small dividend, and the whinger's preferred choice is what's used.
    use lib9lives::storage_infra_market::StorageInfraMarket;
    with_contract::<_, StorageInfraMarket, _>(|c| {
        c.enabled.set(true);
        set_msg_sender(Address::from([9u8; 20]));
        c.factory_addr.set(msg_sender());
        let trading = Address::from([1u8; 20]);
        let winner = fixed_bytes!("0541d76af67ad076");
        assert_eq!(
            should_spend!(
                FUSDC_ADDR,
                {msg_sender() => INCENTIVE_AMT_BASE},
                c.register(
                    trading,
                    msg_sender(),
                    FixedBytes::<32>::from([1u8; 32]),
                    block_timestamp() + 100,
                    u64::MAX
                )
            ),
            INCENTIVE_AMT_BASE,
        );
        ts_add_time(150);
        c.call(trading, winner, msg_sender()).unwrap();
        // We're currently in day 1, the WHINGING PERIOD. This should
        // last for 2 days.
        let preferred_outcome_whinger = fixed_bytes!("7777777777777777");
        assert_eq!(
            should_spend!(
                FUSDC_ADDR,
                { msg_sender() => BOND_FOR_WHINGE },
                c.whinge(trading, preferred_outcome_whinger, Address::ZERO)
            ),
            BOND_FOR_WHINGE
        );
        panic_guard(|| {
            assert_eq!(
                c.whinge(trading, preferred_outcome_whinger, Address::ZERO)
                    .unwrap_err(),
                Error::AlreadyWhinged
            );
        });
        // We are now 5 days in. The SWEEPING PERIOD.
        let five_days = 432000;
        ts_add_time(five_days);
        // Since no-one predicted, it must be the whinger that was correct!
        assert_eq!(
            c.sweep(
                trading,
                Address::ZERO,
                vec![winner, preferred_outcome_whinger],
                Address::ZERO,
                Address::ZERO,
            )
            .unwrap()
            .0,
            INCENTIVE_AMT_SWEEP
        );
        // We can't call this twice and get anything unless we're liquidating someone!
        assert_eq!(
            c.sweep(
                trading,
                Address::ZERO,
                vec![winner, preferred_outcome_whinger],
                Address::ZERO,
                Address::ZERO,
            )
            .unwrap()
            .0,
            U256::ZERO
        );
        assert_eq!(preferred_outcome_whinger, c.winner(trading).unwrap());
    })
}

fn strat_u256() -> impl Strategy<Value = U256> {
    (0..32).prop_perturb(move |steps, mut rng| {
        U256::from_be_slice(
            (0..=steps)
                .map(|_| rng.gen())
                .collect::<ArrayVec<u8, 256>>()
                .as_slice(),
        )
    })
}

proptest! {
    #[test]
    fn test_unhappy_call_whinge_claim_different_from_caller(
        predictions in proptest::collection::vec((any::<u64>(), strat_u256()), 0..1000)
    ) {
        // Someone creates a market, it's called by someone, the whinger
        // disagrees, the predictors agree in line with the caller.
        with_contract::<_, StorageInfraMarket, _>(|c| {
            c.enabled.set(true);
            set_msg_sender(Address::from([9u8; 20]));
            c.factory_addr.set(msg_sender());
            let trading = Address::from([1u8; 20]);
            let winner = fixed_bytes!("0541d76af67ad076");
            assert_eq!(
                c.register(
                    trading,
                    msg_sender(),
                    FixedBytes::<32>::from([1u8; 32]),
                    block_timestamp() + 100,
                    u64::MAX
                )
                .unwrap(),
                INCENTIVE_AMT_BASE,
            );
            ts_add_time(150);
            c.call(trading, winner, msg_sender()).unwrap();
            // We're currently in day 1, the WHINGING PERIOD. This should
            // last for 2 days.
            let preferred_outcome_whinger = fixed_bytes!("7777777777777777");
            assert_eq!(
                c.whinge(trading, preferred_outcome_whinger, Address::ZERO)
                    .unwrap(),
                BOND_FOR_WHINGE
            );
            panic_guard(|| {
                assert_eq!(
                    c.whinge(trading, preferred_outcome_whinger, Address::ZERO)
                        .unwrap_err(),
                    Error::AlreadyWhinged
                );
            });
            // We are now 5 days in. The SWEEPING PERIOD.
            let five_days = 432000;
            ts_add_time(five_days);
            // Since no-one predicted, it must be the whinger that was correct!
            assert_eq!(
                c.sweep(
                    trading,
                    Address::ZERO,
                    vec![winner, preferred_outcome_whinger],
                    Address::ZERO,
                    Address::ZERO,
                )
                .unwrap().0,
                INCENTIVE_AMT_SWEEP
            );
            // We can't call this twice and get anything unless we're liquidating someone!
            assert_eq!(
                c.sweep(
                    trading,
                    Address::ZERO,
                    vec![winner, preferred_outcome_whinger],
                    Address::ZERO,
                    Address::ZERO,
                )
                .unwrap().0,
                U256::ZERO
            );
            assert_eq!(preferred_outcome_whinger, c.winner(trading).unwrap());
        })
    }
}
