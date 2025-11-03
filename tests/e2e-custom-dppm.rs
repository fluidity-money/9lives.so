#![cfg(all(
    feature = "trading-backend-dppm",
    feature = "testing",
    not(target_arch = "wasm32")
))]

use stylus_sdk::alloy_primitives::{fixed_bytes, Address, FixedBytes, U256, U64};

use lib9lives::{
    error::Error,
    host::{clear_storage, register_addr, reset_msg_sender, set_block_timestamp, set_msg_sender},
    host_erc20_call::{self, test_give_tokens},
    immutables::{DAO_EARN_ADDR, DAO_OP_ADDR},
    interactions_clear_after, maths, proxy, should_spend, should_spend_fusdc_contract,
    should_spend_fusdc_sender,
    testing_addrs::*,
    utils::{block_timestamp, msg_sender, strat_small_u256, strat_uniq_outcomes},
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
            register_addr(
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
            should_spend_fusdc_sender!(
                10e6,
                c.mint_8_A_059_B_6_E(o[1], U256::from(10e6), Address::ZERO, msg_sender())
            );
        },
        IVAN => {
            c.decide(o[0]).unwrap();
        },
        IVAN => {
            should_spend_fusdc_contract!(15115113,
                c.payoff_C_B_6_F_2565(o[0], shares_ivan, msg_sender())
            )
        },
        ERIK => {
            should_spend_fusdc_contract!(
                1884885,
                c.payoff_C_B_6_F_2565(o[1], U256::ZERO, ERIK)
            );
        }
    }
}

#[derive(Debug, Clone, PartialEq)]
struct DppmAction {
    outcome: FixedBytes<8>,
    fusdc_amt: U256,
    time_since: u64,
    sender: Address,
}

fn strat_dppm_action(o_0: FixedBytes<8>, o_1: FixedBytes<8>) -> impl Strategy<Value = DppmAction> {
    (
        strat_small_u256(),
        any::<bool>(),
        1..100_000u64,
        any::<Address>(),
    )
        .prop_map(move |(a, b, time_since, sender)| DppmAction {
            outcome: if b { o_0 } else { o_1 },
            fusdc_amt: a,
            time_since,
            sender,
        })
}

fn strat_dppm_actions() -> impl Strategy<Value = (FixedBytes<8>, FixedBytes<8>, Vec<DppmAction>)> {
    strat_uniq_outcomes(2, 2).prop_flat_map(move |o| {
        proptest::collection::vec(strat_dppm_action(o[0].clone(), o[1].clone()), 5000)
            .prop_map(move |x| (o[0], o[1], x))
    })
}

proptest! {
    #[test]
    fn test_dppm_contract_solvency(
        fee_creator in 0u64..10,
        fee_referrer in 0u64..10,
        referrer_sink_addr in any::<Address>(),
        creator_sink_addr in any::<Address>(),
        (o_0, o_1, actions) in strat_dppm_actions()
    ) {
        clear_storage();
        let mut c = StorageTrading::default();
        set_block_timestamp(1);
        setup_contract!(&mut c, [o_0, o_1]);
        c.fee_recipient.set(creator_sink_addr);
        c.fee_creator.set(U256::from(fee_creator));
        c.fee_referrer.set(U256::from(fee_referrer));
        c.time_ending.set(U64::from(2) + U64::from(
            actions.iter()
                    .map(|DppmAction { time_since, .. }| time_since)
                    .sum::<u64>()
        ));
        let mut contract_bal = U256::from(2e6 as u32);
        let mut referrer_fee = U256::ZERO;
        let mut creator_fee = U256::ZERO;
        let o_1 = c.outcome_list.get(0).unwrap();
        let o_2 = c.outcome_list.get(1).unwrap();
        let actions =
            actions.into_iter().map(|DppmAction { outcome, fusdc_amt, time_since, sender }| {
                contract_bal += fusdc_amt;
                set_block_timestamp(block_timestamp() + time_since);
                set_msg_sender(sender);
                referrer_fee +=  maths::calc_fee(fusdc_amt, U256::from(fee_referrer)).unwrap();
                creator_fee += maths::calc_fee(fusdc_amt, U256::from(fee_creator)).unwrap();
                let M1 = c.dppm_outcome_invested.get(o_1);
                let M2 = c.dppm_outcome_invested.get(o_2);
                let max_fusdc = M1 + M2 + fusdc_amt;
                let e_1 = c.dppm_simulate_payoff_for_address(sender, o_1).unwrap();
                let e_2 = c.dppm_simulate_payoff_for_address(sender, o_2).unwrap();
                assert!(max_fusdc >= e_1.0 + e_1.1);
                assert!(max_fusdc >= e_2.0 + e_2.1);
                let e = c.dppm_simulate_earnings(fusdc_amt, outcome).unwrap();
                // We need to check that the winning payout and Ninetails payout can
                // never exceed the pool balance:
                assert!(max_fusdc >= e.0 + e.1, "{max_fusdc} <= {} + {}", e.0, e.1);
                assert!(max_fusdc >= e.0 + e.2, "{max_fusdc} <= {}", e.0 + e.2);
                // We need to check that the loser payout can never exceed the winner
                // payout for Ninetails:
                assert!(e.1 > e.2, "{} <= {}", e.1, e.2);
                assert!(max_fusdc > e.2, "{} <= {}", e.1, e.2);
                let s = should_spend_fusdc_sender!(fusdc_amt, {
                    match (fusdc_amt.is_zero(), c.mint_8_A_059_B_6_E(
                        outcome,
                        fusdc_amt,
                        referrer_sink_addr,
                        sender,
                    )) {
                        (true, Ok(_)) => panic!("amount is zero but mint was ok"),
                        (false, Ok(s)) => Ok(s),
                        (true, Err(Error::ZeroAmount)) => Ok(U256::ZERO),
                        (false, Err(Error::MintAmountTooLow)) => {
                            // The amount here is zero, though we collect a fee. This is a divergence
                            // from the on-chain behaviour, where the rollback would result in no
                            // fees being collected. In this case, we collect fees, since a revert
                            // doesn't change the storage. But we do assume nothing will be taken.
                            Ok(U256::ZERO)
                        },
                        (_, Err(e)) => Err(e)
                    }
                });
                (outcome, s, sender)
            })
            .collect::<Vec<_>>();
        reset_msg_sender();
        c.oracle.set(msg_sender());
        c.decide(o_0).unwrap();
        assert!(!c.is_not_done_predicting());
        assert!(!c.when_decided.is_zero());
        test_give_tokens(FUSDC, CONTRACT, contract_bal);
        for (o, s, sender) in actions {
            if s.is_zero() { continue }
            set_msg_sender(sender);
            if o == o_0 {
                contract_bal -= should_spend!(
                    c.share_addr(o).unwrap(),
                    { sender => s },
                    c.payoff_C_B_6_F_2565(o, s, sender)
                )
            } else {
                    c.payoff_C_B_6_F_2565(o, U256::ZERO, sender)
                        .unwrap();
            }
        }
        let referrer_claimant = if referrer_sink_addr.is_zero() {
            DAO_OP_ADDR
        } else {
            referrer_sink_addr
        };
        if referrer_claimant == creator_sink_addr || referrer_sink_addr == creator_sink_addr {
            // If the claimant addresses are the same, collect them at once.
            set_msg_sender(creator_sink_addr);
            assert_eq!(
                referrer_fee + creator_fee,
                c.claim_all_fees_332_D_7968(creator_sink_addr).unwrap()
            );
        } else {
            // If the claimant addresses are different, collect them separately.
            set_msg_sender(referrer_claimant);
            assert_eq!(referrer_fee, c.claim_all_fees_332_D_7968(DAO_EARN_ADDR).unwrap());
            set_msg_sender(creator_sink_addr);
            assert_eq!(creator_fee, c.claim_all_fees_332_D_7968(creator_sink_addr).unwrap());
        }
        // The contract will collect dust, so we don't care about leftover
        // amounts.
        host_erc20_call::cleanup();
    }
}
