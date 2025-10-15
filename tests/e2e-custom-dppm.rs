#![cfg(all(
    feature = "trading-backend-dppm",
    feature = "testing",
    not(target_arch = "wasm32")
))]

use stylus_sdk::alloy_primitives::{fixed_bytes, Address, FixedBytes, U256, U64};

use lib9lives::{
    host, proxy,
    testing_addrs::{CONTRACT, SHARE},
    utils::{block_timestamp, msg_sender},
    StorageTrading, should_spend_fusdc_sender
};

use proptest::prelude::*;

macro_rules! setup_contract {
    ($c:expr, $outcomes:expr) => {
        let c = $c;
        let outcomes = $outcomes;
        c.created.set(false);
        c.is_protocol_fee_disabled.set(true);
        c.ctor((
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
            0,
        ))
        .unwrap();
        c.amm_liquidity.set(U256::ZERO);
        c.when_decided.set(U64::ZERO);
        c.is_shutdown.set(false);
        c.winner.set(FixedBytes::<8>::ZERO);
        for (i, o) in outcomes.iter().enumerate() {
            host::register_addr(
                proxy::get_share_addr(c.factory_addr.get(), CONTRACT, c.share_impl.get(), *o),
                format!("outcome share {o}, outcome id {i}"),
            );
        }
    };
}

#[test]
fn test_simple() {
    // An hour long deadline:
    let mut c = StorageTrading::default();
    let o = [
        fixed_bytes!("04c4eb8d625af112"),
        fixed_bytes!("0c5829d33c3ab9f6")
    ];
    setup_contract!(&mut c, o);
    c.time_ending.set(U64::from(block_timestamp() + 60 * 60));
    should_spend_fusdc_sender!(
        5e6,
        c.mint_8_A_059_B_6_E(
            o[0],
            U256::from(5e6),
            Address::ZERO,
            msg_sender()
        )
    );
}
