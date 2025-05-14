#![cfg(all(
    feature = "trading-backend-amm",
    feature = "testing",
    not(target_arch = "wasm32")
))]

use stylus_sdk::{
    alloy_primitives::fixed_bytes,
    alloy_primitives::{Address, FixedBytes, U256, U64},
};

use lib9lives::{
    actions::*, error::Error, fees::FEE_SCALING, host, implement_action, interactions_clear_after,
    maths, panic_guard, proxy, should_spend, should_spend_fusdc_contract,
    should_spend_fusdc_sender, strat_storage_trading, testing_addrs::*, utils::*, StorageTrading,
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

macro_rules! test_add_liquidity {
    ($c:expr, $amt:expr) => {
        let buy_amt = U256::from($amt);
        should_spend_fusdc_sender!(buy_amt, $c.add_liquidity_test(buy_amt, msg_sender()))
    };
}

proptest! {
    // FIXME
    #[test]
    #[ignore]
    fn test_amm_dilution_event_1(
        outcomes in strat_uniq_outcomes(2, 2),
        mut c in strat_storage_trading(false)
    ) {
        let outcome_a = outcomes[0];
        let outcome_b = outcomes[1];
        // Test that someone is not able to come in and claim from the pool after
        // just LPing, and not being there from the outset in doing so.
        let fee_take_amt = 20;
        let amt = 100_000 * 1e6 as u64;
        let fee = (amt * fee_take_amt) / 1000;
        let amt = U256::from(amt);
        interactions_clear_after! {
            IVAN => {
                setup_contract!(&mut c, &[outcome_a, outcome_b]);
                c.fee_lp.set(U256::from(fee_take_amt));
                test_add_liquidity!(&mut c, 1000e6 as u64);
                should_spend_fusdc_sender!(
                    amt,
                    c.mint_8_A_059_B_6_E(
                        outcome_a,
                        amt,
                        Address::ZERO,
                        msg_sender(),
                    )
                );
            },
            ERIK => {
                test_add_liquidity!(&mut c, 100_00e6 as u64);
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
        outcomes in strat_uniq_outcomes(2, 2),
        mut c in strat_storage_trading(false)
    ) {
        let outcome_a = outcomes[0];
        let outcome_b = outcomes[1];
        // Test that someone can make a swap, and the existing LP is entitled to
        // X fees, then a new LP only gets the fees from the next trade.
        let fee_take_amt = 20;
        let ivan_amt = 100_000 * 1e6 as u64;
        let erik_amt = 2881e6 as u64;
        let ivan_fee = (ivan_amt * fee_take_amt) / 1000;
        let erik_fee = (erik_amt * fee_take_amt) / 1000;
        interactions_clear_after! {
            IVAN => {
                setup_contract!(&mut c, &[outcome_a, outcome_b]);
                c.fee_lp.set(U256::from(fee_take_amt));
                test_add_liquidity!(&mut c, 1000e6 as u64);
                let amt = U256::from(ivan_amt);
                should_spend_fusdc_sender!(
                    amt,
                    c.mint_8_A_059_B_6_E(
                        outcome_a,
                        amt,
                        Address::ZERO,
                        msg_sender(),
                    )
                );
            },
            ERIK => {
                let erik_amt = U256::from(erik_amt);
                test_add_liquidity!(&mut c, 100_00e6 as u64);
                panic_guard(|| {
                    assert_eq!(
                        Error::NoFeesToClaim,
                        c.claim_lp_fees_66980_F_36(msg_sender()).unwrap_err()
                    );
                });
                should_spend_fusdc_sender!(
                    erik_amt,
                    c.mint_8_A_059_B_6_E(
                        outcome_a,
                        erik_amt,
                        Address::ZERO,
                        msg_sender(),
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
        outcomes in strat_uniq_outcomes(100, 100),
        mut c in strat_storage_trading(false),
        actions in proptest::collection::vec((any::<Address>(), strat_action()), 1..1000)
    ) {
        setup_contract!(&mut c, &outcomes);
        for (sender, a) in actions {
            implement_action!(c, sender, a);
        }
    }

    #[test]
    fn test_amm_access_control_okay_1(
        outcomes in strat_uniq_outcomes(2, 10),
        mut c in strat_storage_trading(false),
        rand_word in strat_large_u256()
    ) {
        setup_contract!(&mut c, &outcomes);
        panic_guard(|| {
            // A user should not be able to use payoff with a campaign that hasn't ended.
            assert_eq!(
                Error::NotWinner,
                c.payoff_C_B_6_F_2565(
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

    #[test]
    fn test_five_outcomes(
        outcomes in strat_uniq_outcomes(2, 7),
        mut c in strat_storage_trading(false)
    ) {
        interactions_clear_after! {
            IVAN => {
                setup_contract!(&mut c, &outcomes);
                test_add_liquidity!(&mut c, 1000e6 as u64);
            }
        }
    }

    #[test]
    fn test_amm_variable_outcomes(
        outcomes in strat_uniq_outcomes(2, 5),
        mut c in strat_storage_trading(false)
    ) {
        interactions_clear_after! {
            IVAN => {
                setup_contract!(&mut c, &outcomes);
                test_add_liquidity!(&mut c, 10e6 as u64);
            }
        }
    }

    #[test]
    fn test_amm_breaking_specific_26k(
        outcomes in strat_uniq_outcomes(2, 10),
        mut c in strat_storage_trading(false)
    ) {
        interactions_clear_after! {
            ERIK => {
                setup_contract!(&mut c, &outcomes);
                test_add_liquidity!(&mut c, 100_000e6 as u64);
            }
        }
    }

    #[test]
    fn test_amm_tiny_mint_into_burning(
        add_lp in strat_medium_u256(),
        fee_for_creator in (0..=100).prop_map(U256::from),
        fee_for_minter in (0..=100).prop_map(U256::from),
        fee_for_lp in (0..=100).prop_map(U256::from),
        fee_for_referrer in (0..=100).prop_map(U256::from),
        (outcomes, referrers, acts) in strat_tiny_mint_into_burn_outcomes(10, 10, 100, 1000),
        mut c in strat_storage_trading(false)
    )
    {
        // Test up to a thousand mint and burn operations from a hundred minimum.
        interactions_clear_after! {
            IVAN => {
                setup_contract!(&mut c, &outcomes);
                test_add_liquidity!(&mut c, add_lp);
                let cum_fee = fee_for_creator + fee_for_minter + fee_for_lp + fee_for_referrer;
                for a in acts {
                    if let [Action::Mint(ActionMint {
                        outcome: m_out,
                        referrer: m_ref,
                        usd_amt: m_u,
                    }), Action::Burn(ActionBurn {
                        outcome: b_out,
                        referrer: b_referrer,
                        usd_amt: b_amt,
                        ..
                    })] = a
                    {
                        let shares = should_spend_fusdc_sender!(
                            m_u,
                            c.mint_8_A_059_B_6_E(m_out, m_u, m_ref, msg_sender())
                        );
                        let target =
                            shares - maths::mul_div_round_up(shares, U256::from(100), FEE_SCALING).unwrap();
                        panic_guard(|| {
                            should_spend_fusdc_contract!(
                                b_amt,
                                {
                                    //target instead of U256::ZERO todo
                                    c.burn_854_C_C_96_E(b_out, b_amt, false, U256::ZERO, m_ref, msg_sender())
                                        .map_err(|_| panic!("unable to burn: received shares {shares} from mint. minted {m_u} for outcome {m_out}. trying to burn {b_amt}, minimum {target}, outcome {b_out}"))
                                        .unwrap();
                                    Ok(())
                                }
                            );
                        });
                    }
                }
            }
        }
    }
}

#[test]
#[allow(non_snake_case)]
fn test_amm_reproduction_0x276b5b896b088c5604E7333df90f7691d6FDE93A_1621096() {
    let outcomes = [
        fixed_bytes!("009380e6201ad444"),
        fixed_bytes!("72e84ce41b33954e"),
        fixed_bytes!("9cff5edbbb8ac0a9"),
        fixed_bytes!("a7913c07dc467994"),
    ];
    interactions_clear_after! {
        IVAN => {
            let mut c = StorageTrading::default();
            setup_contract!(&mut c, &outcomes);
            //c.fee_creator.set(U256::from(0));
            //c.fee_minter.set(U256::from(0));
            //c.fee_lp.set(U256::from(0));
            //c.fee_referrer.set(U256::from(0));
            c.is_protocol_fee_disabled.set(true); // Disabled by the generator!
            //c.is_protocol_fee_disabled.set(false);
            c.amm_liquidity.set(U256::from(1000000));
            c.amm_outcome_prices.setter(fixed_bytes!("009380e6201ad444")).set(U256::from(0));
            c.amm_outcome_prices.setter(fixed_bytes!("72e84ce41b33954e")).set(U256::from(0));
            c.amm_outcome_prices.setter(fixed_bytes!("9cff5edbbb8ac0a9")).set(U256::from(0));
            c.amm_outcome_prices.setter(fixed_bytes!("a7913c07dc467994")).set(U256::from(0));
            c.amm_shares.setter(fixed_bytes!("009380e6201ad444")).set(U256::from(5960000));
            c.amm_shares.setter(fixed_bytes!("72e84ce41b33954e")).set(U256::from(5960000));
            c.amm_shares.setter(fixed_bytes!("9cff5edbbb8ac0a9")).set(U256::from(4724));
            c.amm_shares.setter(fixed_bytes!("a7913c07dc467994")).set(U256::from(5960000));
            c.amm_total_shares.setter(fixed_bytes!("009380e6201ad444")).set(U256::from(5960000));
            c.amm_total_shares.setter(fixed_bytes!("72e84ce41b33954e")).set(U256::from(5960000));
            c.amm_total_shares.setter(fixed_bytes!("9cff5edbbb8ac0a9")).set(U256::from(5960000));
            c.amm_total_shares.setter(fixed_bytes!("a7913c07dc467994")).set(U256::from(5960000));
            c.amm_user_liquidity_shares.setter(msg_sender()).set(U256::from(1000000));
            c.amm_fees_collected_weighted.set(U256::from(0));
            c.amm_lp_global_fees_claimed.set(U256::from(0));
            c.amm_lp_user_fees_claimed.setter(msg_sender()).set(U256::from(0));

            assert_eq!((U256::from(5954797), U256::from(4959880)), should_spend!(
                c.share_addr(fixed_bytes!("9cff5edbbb8ac0a9")).unwrap(),
                { msg_sender() => 5954797 },
                Ok(should_spend_fusdc_contract!(
                    4959880,
                    c.burn_854_C_C_96_E(
                        fixed_bytes!("9cff5edbbb8ac0a9"),
                        U256::from(5955276),
                        true,
                        U256::ZERO,
                        msg_sender(),
                        msg_sender()
                    )
                ))
            ));
        }
    }
}
