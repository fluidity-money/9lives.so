#![cfg(all(
    feature = "trading-backend-amm",
    feature = "testing",
    not(target_arch = "wasm32")
))]

use stylus_sdk::alloy_primitives::{Address, FixedBytes, U256, U64};

use lib9lives::{
    actions::strat_action, error::Error, host, implement_action, interactions_clear_after,
    panic_guard, proxy, should_spend_fusdc_contract, should_spend_fusdc_sender,
    strat_storage_trading, testing_addrs::*, utils::*, StorageTrading,
};

use proptest::prelude::*;

fn setup_contract(c: &mut StorageTrading, outcomes: &[FixedBytes<8>]) {
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
            format!("outcome share {o}, count {i}"),
        );
    }
}

fn test_add_liquidity(c: &mut StorageTrading, amt: u64) -> (U256, Vec<(FixedBytes<8>, U256)>) {
    let buy_amt = U256::from(amt);
    should_spend_fusdc_sender!(buy_amt, c.add_liquidity_test(buy_amt, msg_sender()))
}

proptest! {
    // FIXME
    #[test]
    #[ignore]
    fn test_amm_dilution_event_1(
        outcome_a in strat_fixed_bytes::<8>(),
        outcome_b in strat_fixed_bytes::<8>(),
        mut c in strat_storage_trading(false)
    ) {
        // Test that someone is not able to come in and claim from the pool after
        // just LPing, and not being there from the outset in doing so.
        let fee_take_amt = 20;
        let amt = 100_000 * 1e6 as u64;
        let fee = (amt * fee_take_amt) / 1000;
        let amt = U256::from(amt);
        interactions_clear_after! {
            IVAN => {
                setup_contract(&mut c, &[outcome_a, outcome_b]);
                c.fee_lp.set(U256::from(fee_take_amt));
                test_add_liquidity(&mut c, 1000e6 as u64);
                should_spend_fusdc_sender!(
                    amt,
                    c.mint_permit_243_E_E_C_56(
                        outcome_a,
                        amt,
                        Address::ZERO,
                        msg_sender(),
                        U256::ZERO,
                        0,
                        FixedBytes::ZERO,
                        FixedBytes::ZERO,
                    )
                );
            },
            ERIK => {
                test_add_liquidity(&mut c, 100_00e6 as u64);
                panic_guard(|| {
                    assert_eq!(
                        Error::NoFeesToClaim,
                        c.claim_lp_fees_66980_F_36(msg_sender()).unwrap_err()
                    );
                });
            },
            IVAN => {
                should_spend_fusdc_contract!(
                    U256::from(fee),
                    c.claim_lp_fees_66980_F_36(msg_sender())
                );
            }
        }
    }

    // FIXME
    #[test]
    #[ignore]
    fn test_amm_dilution_event_2(
        outcome_a in strat_fixed_bytes::<8>(),
        outcome_b in strat_fixed_bytes::<8>(),
        mut c in strat_storage_trading(false)
    ) {
        // Test that someone can make a swap, and the existing LP is entitled to
        // X fees, then a new LP only gets the fees from the next trade.
        let fee_take_amt = 20;
        let ivan_amt = 100_000 * 1e6 as u64;
        let erik_amt = 2881e6 as u64;
        let ivan_fee = (ivan_amt * fee_take_amt) / 1000;
        let erik_fee = (erik_amt * fee_take_amt) / 1000;
        interactions_clear_after! {
            IVAN => {
                setup_contract(&mut c, &[outcome_a, outcome_b]);
                c.fee_lp.set(U256::from(fee_take_amt));
                test_add_liquidity(&mut c, 1000e6 as u64);
                let amt = U256::from(ivan_amt);
                should_spend_fusdc_sender!(
                    amt,
                    c.mint_permit_243_E_E_C_56(
                        outcome_a,
                        amt,
                        Address::ZERO,
                        msg_sender(),
                        U256::ZERO,
                        0,
                        FixedBytes::ZERO,
                        FixedBytes::ZERO,
                    )
                );
            },
            ERIK => {
                let erik_amt = U256::from(erik_amt);
                test_add_liquidity(&mut c, 100_00e6 as u64);
                panic_guard(|| {
                    assert_eq!(
                        Error::NoFeesToClaim,
                        c.claim_lp_fees_66980_F_36(msg_sender()).unwrap_err()
                    );
                });
                should_spend_fusdc_sender!(
                    erik_amt,
                    c.mint_permit_243_E_E_C_56(
                        outcome_a,
                        erik_amt,
                        Address::ZERO,
                        msg_sender(),
                        U256::ZERO,
                        0,
                        FixedBytes::ZERO,
                        FixedBytes::ZERO,
                    )
                );
            },
            IVAN => {
                should_spend_fusdc_contract!(
                    U256::from(ivan_fee),
                    c.claim_lp_fees_66980_F_36(msg_sender())
                );
            },
            ERIK => {
                should_spend_fusdc_contract!(
                    U256::from(erik_fee),
                    c.claim_lp_fees_66980_F_36(msg_sender())
                );
            }
        }
    }

    // FIXME
    #[test]
    #[ignore]
    fn test_amm_crazy_testing_1(
        outcomes in proptest::collection::vec(strat_fixed_bytes::<8>(), 2..100),
        mut c in strat_storage_trading(false),
        actions in proptest::collection::vec((any::<Address>(), strat_action()), 1..1000)
    ) {
        setup_contract(&mut c, &outcomes);
        for (sender, a) in actions {
            implement_action!(c, sender, a);
        }
    }

    #[test]
    fn test_amm_access_control_okay_1(
        outcomes in proptest::collection::vec(strat_fixed_bytes::<8>(), 2..100),
        mut c in strat_storage_trading(false),
        rand_word in strat_large_u256()
    ) {
        setup_contract(&mut c, &outcomes);
        panic_guard(|| {
            // A user should not be able to use payoff with a campaign that hasn't ended.
            assert_eq!(
                Error::NotWinner,
                c.payoff_8_5_D_8_D_F_C_9(
                    outcomes[0],
                    rand_word,
                    msg_sender()
                ).unwrap_err()
            );
            // A user should not be able to claim liquidity from a campaign that hasn't ended.
            assert_eq!(
                Error::NotDecided,
                c.claim_liquidity_9_C_391_F_85(msg_sender()).unwrap_err()
            );
            // A user should not be able to add, remove, or mint liquidity for a
            // campaign that has ended.
        })
    }
}
