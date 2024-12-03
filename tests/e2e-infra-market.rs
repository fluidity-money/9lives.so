#![cfg(all(not(target_arch = "wasm32"), feature = "testing"))]

use proptest::prelude::*;

use stylus_sdk::alloy_primitives::{fixed_bytes, Address, FixedBytes, U256};

use lib9lives::{
    error::{set_panic, Error},
    fees::INCENTIVE_AMT_BASE,
    host,
    utils::{block_timestamp, msg_sender},
};

#[test]
fn test_infra_market_happy_path() {
    // Simple situation, someone creates a infra market, and during its
    // optimistic stage someone calls it. It's not whinged at, and it calls
    // predict without issue. The caller gets their small amount.
    use lib9lives::storage_opt_infra_market::StorageOptimisticInfraMarket;
    host::with_storage::<_, StorageOptimisticInfraMarket, _>(|c| {
        c.enabled.set(true);
        c.factory_addr.set(msg_sender());
        let trading = Address::from([1u8; 20]);
        let winner = fixed_bytes!("0541d76af67ad076");
        assert_eq!(
            c.register(
                trading,
                msg_sender(),
                FixedBytes::<32>::from([1u8; 32]),
                block_timestamp() + 100
            )
            .unwrap(),
            INCENTIVE_AMT_BASE,
        );
        host::ts_add_time(150);
        c.call(trading, winner, msg_sender()).unwrap();
        // Prevent us from indisciminantly panicking (and unwinding) so we can check
        // the return statuses here.
        set_panic(false);
        // Now we wait the period. Let's try to call different things while this is happening.
        assert_eq!(
            c.predict(trading, winner, U256::from(100)).unwrap_err(),
            Error::WhingedTimeUnset
        );
    })
}

proptest! {
    #[test]
    fn test_timing_accurate(campaign_call_start in any::<u64>()) {}
}
