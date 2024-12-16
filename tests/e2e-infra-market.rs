#![cfg(all(not(target_arch = "wasm32"), feature = "testing"))]

use proptest::prelude::*;

use stylus_sdk::alloy_primitives::{fixed_bytes, Address, FixedBytes};

use lib9lives::{
    error::{panic_guard, Error},
    fees,
    fees::INCENTIVE_AMT_BASE,
    host::{set_msg_sender, ts_add_time, with_contract},
    utils::{block_timestamp, msg_sender},
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
                Error::WhingedTimeUnset
            );
        });
        let two_days = 172800;
        ts_add_time(two_days + 10);
        // No-one called claim! It's time for us to call close.
        assert_eq!(
            c.close(trading, msg_sender()).unwrap(),
            fees::INCENTIVE_AMT_CLOSE
        );
        // Let's confirm that the winner was set correctly.
        assert_eq!(c.winner(trading).unwrap(), winner);
    })
}

#[test]
fn test_unhappy_call_whinge_claim_no_bettors_path() {
    // In this situation, someone calls the call code, but unfortunately,
    // someone whinges about it. During the 7 day period that follows, NO-ONE
    // calls the contract (strangely enough). Let's test here what happens if
    // that's the case.
    use lib9lives::storage_infra_market::StorageInfraMarket;
    with_contract::<_, StorageInfraMarket, _>(|c| {})
}

proptest! {
    #[test]
    fn test_timing_accurate(campaign_call_start in any::<u64>()) {}
}
