#![cfg(all(
    feature = "trading-backend-amm",
    feature = "testing",
    not(target_arch = "wasm32")
))]

use stylus_sdk::alloy_primitives::{FixedBytes, U256, U64};

use lib9lives::{
    actions::strat_action, host, implement_action, proxy, strat_storage_trading,
    testing_addrs::*, utils::*, StorageTrading,
};

use proptest::prelude::*;

fn setup_contract(c: &mut StorageTrading, outcomes: &[FixedBytes<8>]) {
    c.created.set(false);
    c.ctor(
        outcomes.to_vec(),
        msg_sender(),
        block_timestamp() + 1,
        block_timestamp() + 10,
        msg_sender(),
        SHARE,
        false,
        0,
        0,
        0,
    )
    .unwrap();
    c.amm_liquidity.set(U256::ZERO);
    c.when_decided.set(U64::ZERO);
    c.is_shutdown.set(false);
    for (i, o) in outcomes.iter().enumerate() {
        host::register_addr(
            proxy::get_share_addr(c.factory_addr.get(), CONTRACT, c.share_impl.get(), *o),
            format!("outcome share {o}, count {i}"),
        );
    }
}

proptest! {
    #[test]
    fn test_amm_crazy_testing_1(
        outcomes in proptest::collection::vec(strat_fixed_bytes::<8>(), 2..100),
        mut c in strat_storage_trading(false),
        actions in proptest::collection::vec((strat_address(), strat_action()), 1..1000)
    ) {
        setup_contract(&mut c, &outcomes);
        for (sender, a) in actions {
            implement_action!(c, sender, a);
        }
    }
}
