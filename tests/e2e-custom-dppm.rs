#![cfg(all(
    feature = "trading-backend-dppm",
    feature = "testing",
    not(target_arch = "wasm32")
))]

use stylus_sdk::alloy_primitives::{fixed_bytes, Address, FixedBytes, U256, U64};

use lib9lives::{
    host,
    host::set_block_timestamp,
    interactions_clear_after, proxy, should_spend_fusdc_contract, should_spend_fusdc_sender,
    testing_addrs::*,
    utils::{block_timestamp, msg_sender},
    StorageTrading,
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
fn test_dppm_simple() {
    // An hour long deadline:
    let mut c = StorageTrading::default();
    let o = [
        fixed_bytes!("04c4eb8d625af112"),
        fixed_bytes!("0c5829d33c3ab9f6"),
    ];
    let mut shares_ivan = U256::ZERO;
    let mut shares_erik = U256::ZERO;
    interactions_clear_after! {
        IVAN => {
            setup_contract!(&mut c, o);
            c.time_ending.set(U64::from(block_timestamp() + 60 * 60));
            set_block_timestamp(5 * 60);
            shares_ivan = should_spend_fusdc_sender!(
                5e6,
                c.mint_8_A_059_B_6_E(o[0], U256::from(5e6), Address::ZERO, msg_sender())
            );
        },
        ERIK => {
            set_block_timestamp(30 * 60);
            shares_erik = should_spend_fusdc_sender!(
                10e6,
                c.mint_8_A_059_B_6_E(o[1], U256::from(10e6), Address::ZERO, msg_sender())
            );
        },
        IVAN => {
            c.decide(o[0]).unwrap();
        },
        IVAN => {
            should_spend_fusdc_contract!(15617565,
                c.payoff_C_B_6_F_2565(o[0], shares_ivan, msg_sender())
            )
        },
        ERIK => {
            should_spend_fusdc_contract!(1382433, c.payoff_C_B_6_F_2565(o[1], 0, ERIK));
        }
    }
}

#[derive(Debug, Clone, PartialEq)]
struct DppmAction {
    outcome: FixedBytes<8>,
    fusdc_amt: U256,
}

fn strat_dppm_action(o_0: FixedBytes<8>, o_1: FixedBytes<8>) -> impl Strategy<Value = DppmAction> {
    (strat_tiny_u256(), any::<bool>()).prop_map(|(a, b)| (a, if b { o_0 } else { o_1 }))
}

fn strat_dppm_actions() -> impl Strategy<Value = (FixedBytes<8>, FixedBytes<8>, Vec<DppmAction>)> {
    proptest::collections::vec::<strat_dpm_action>(200).prop_map(|items| {})
}

proptest! {
    #[test]
    fn test_basic_invariants() {
        // Test that the contract will always remain solvent, not that the users
        // will necessarily make money.
    }
}
