#![cfg(all(
    feature = "trading-backend-amm",
    feature = "testing",
    not(target_arch = "wasm32")
))]

use stylus_sdk::alloy_primitives::{Address, FixedBytes, U256, U64};

use lib9lives::{
    actions::*, error::Error, fees::FEE_SCALING, host, immutables::*, interactions_clear_after,
    maths, panic_guard, proxy, should_spend, should_spend_fusdc_contract,
    should_spend_fusdc_sender, strat_storage_trading, testing_addrs::*, utils::*, StorageTrading,
};

use proptest::prelude::*;

macro_rules! setup_contract {
    ($c:expr, $outcomes:expr, $startup_liq:expr) => {
        let c = $c;
        let outcomes = $outcomes;
        let startup_liq = U256::from($startup_liq);
        c.created.set(false);
        c.is_protocol_fee_disabled.set(true);
        c.ctor((
            outcomes.to_vec(),
            msg_sender(),
            block_timestamp() + 1,
            block_timestamp() + 10,
            msg_sender(),
            false,
            0,
            0,
            0,
            0,
            startup_liq,
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
        should_spend_fusdc_sender!(
            buy_amt,
            $c.add_liquidity_B_9_D_D_A_952(buy_amt, msg_sender(), U256::ZERO, U256::MAX)
        )
    };
}

proptest! {
    #[test]
    fn test_amm_access_control_okay_1(
        outcomes in strat_uniq_outcomes(2, 10),
        mut c in strat_storage_trading(false),
        rand_word in strat_large_u256(),
        setup_liq in strat_tiny_u256()
    ) {
        setup_contract!(&mut c, &outcomes, setup_liq);
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
            // We can have claim-like behaviour by checking if the system reverts that zero
            // shares were trying to be claimed.
            assert_eq!(
                Error::NotEnoughLiquidity,
                c.remove_liquidity_3_C_857_A_15(U256::ZERO, msg_sender()).unwrap_err()
            );
            // A user should not be able to add, remove, or mint liquidity for a
            // campaign that has ended.
        })
    }

    #[test]
    fn test_five_outcomes(
        outcomes in strat_uniq_outcomes(2, 7),
        mut c in strat_storage_trading(false),
        startup_liq in strat_tiny_u256()
    ) {
        interactions_clear_after! {
            IVAN => {
                setup_contract!(&mut c, &outcomes, startup_liq);
                test_add_liquidity!(&mut c, 1000e6 as u64);
            }
        }
    }

    #[test]
    fn test_amm_variable_outcomes(
        outcomes in strat_uniq_outcomes(2, 5),
        mut c in strat_storage_trading(false),
        startup_liq in strat_tiny_u256()
    ) {
        interactions_clear_after! {
            IVAN => {
                setup_contract!(&mut c, &outcomes, startup_liq);
                test_add_liquidity!(&mut c, 10e6 as u64);
            }
        }
    }

    #[test]
    fn test_amm_breaking_specific_26k(
        outcomes in strat_uniq_outcomes(2, 10),
        mut c in strat_storage_trading(false),
        startup_liq in strat_tiny_u256()
    ) {
        interactions_clear_after! {
            ERIK => {
                setup_contract!(&mut c, &outcomes, startup_liq);
                test_add_liquidity!(&mut c, 100_000e6 as u64);
            }
        }
    }

    #[test]
    fn test_amm_simulate_swag(
        o in strat_uniq_outcomes(2, 2),
        mut c in strat_storage_trading(false),
        startup_liq in strat_tiny_u256()
    ) {
        interactions_clear_after! {
            IVAN => {
                setup_contract!(&mut c, &o, startup_liq);
                test_add_liquidity!(&mut c, 10_000e6);
                should_spend_fusdc_sender!(
                    1446413256,
                    c.mint_8_A_059_B_6_E(
                        o[0],
                        U256::from(1446413256),
                        Address::ZERO,
                        msg_sender()
                    )
                );
                should_spend!(
                    c.share_addr(o[0]).unwrap(),
                    { msg_sender() => 1078178763 },
                    c.burn_854_C_C_96_E(
                        o[0],
                        U256::from(597244168),
                        false,
                        U256::ZERO,
                        Address::ZERO,
                        msg_sender()
                    )
                );
            }
        }
    }

    #[test]
    fn test_amm_tiny_mint_into_burning(
        add_lp in strat_tiny_u256(),
        (outcomes, _, acts) in strat_tiny_mint_into_burn_outcomes(10, 10, 10, 1000),
        mut c in strat_storage_trading(false),
        startup_liq in strat_tiny_u256()
    )
    {
        // Test up to a thousand mint and burn operations from a hundred minimum.
        interactions_clear_after! {
            IVAN => {
                setup_contract!(&mut c, &outcomes, startup_liq);
                test_add_liquidity!(&mut c, add_lp);
                for (_, a) in acts.iter().enumerate() {
                    if let [Action::Mint(ActionMint {
                        outcome: m_out,
                        referrer: m_ref,
                        usd_amt: m_u,
                    }), Action::Burn(ActionBurn {
                        outcome: b_out,
                        usd_amt: b_amt,
                        ..
                    })] = *a
                    {
                        let (q, _, _) = c.quote_C_0_E_17_F_C_7(m_out, m_u).unwrap();
                        let shares = should_spend!(
                            c.share_addr(m_out).unwrap(),
                            { ZERO_FOR_MINT_ADDR => q },
                            Ok(should_spend_fusdc_sender!(
                                m_u,
                                c.mint_8_A_059_B_6_E(m_out, m_u, m_ref, msg_sender())
                            ))
                        );
                        let target =
                            shares - maths::mul_div_round_up(shares, U256::from(100), FEE_SCALING).unwrap();
                        panic_guard(|| {
                            should_spend_fusdc_contract!(
                                b_amt,
                                {
                                    //target instead of U256::ZERO todo
                                    c.burn_854_C_C_96_E(b_out, b_amt, false, U256::ZERO, m_ref, msg_sender())
                                        .map_err(|_| {
                                            print_market_config(&c, add_lp);
                                            print_bal_mint_burn_state_until(&outcomes, &acts);
                                            panic!("unable to burn: received shares {shares} from mint. minted {m_u} for outcome {m_out}. trying to burn {b_amt}, minimum {target}, outcome {b_out}")
                                        })
                                        .unwrap();
                                    Ok(())
                                }
                            );
                        });
                    }
                }
                if add_lp > (SHARE_DECIMALS_EXP * U256::from(2)) {
                    let t = add_lp - SHARE_DECIMALS_EXP;
                    should_spend_fusdc_contract!(
                        t,
                        Ok(
                            c.remove_liquidity_3_C_857_A_15(t, msg_sender())
                                .map_err(|_| {
                                    print_market_config(&c, add_lp);
                                    print_bal_mint_burn_state_until(&outcomes, &acts);
                                    panic!("unable to remove liq: trying to remove {add_lp}")
                                })
                                .unwrap()
                        )
                    );
                }
            }
        }
    }
}

fn print_market_config(c: &StorageTrading, liq: U256) {
    eprintln!(
        r#"market = PredMarketNew(liquidity={liq} / 1e6, outcomes={}, fees={})
market.add_user("Alice")"#,
        c.outcome_list.len(),
        c.fee_creator.get() + c.fee_minter.get() + c.fee_lp.get() + c.fee_referrer.get()
    )
}

fn print_bal_mint_burn_state_until(outcomes: &[FixedBytes<8>], acts: &[[Action; 2]]) {
    let cum_ask = acts.iter().fold(U256::ZERO, |acc, [a, _]| {
        if let Action::Mint(ActionMint { usd_amt, .. }) = a {
            acc + usd_amt
        } else {
            unimplemented!()
        }
    });
    eprintln!(r#"market.user_wallet_usd["Alice"] = {cum_ask} / 1e6"#);
    for [m, b] in acts {
        if let Action::Mint(ActionMint {
            outcome, usd_amt, ..
        }) = m
        {
            let o_i = outcomes.iter().position(|x| x == outcome).unwrap();
            eprintln!(r#"market.buy({o_i}, {usd_amt} / 1e6, "Alice")"#);
        }
        if let Action::Burn(ActionBurn {
            outcome, usd_amt, ..
        }) = b
        {
            let o_i = outcomes.iter().position(|x| x == outcome).unwrap();
            eprintln!(r#"market.sell({o_i}, {usd_amt} / 1e6, "Alice")"#);
        }
    }
}
