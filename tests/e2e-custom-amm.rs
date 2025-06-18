#![cfg(all(
    feature = "trading-backend-amm",
    feature = "testing",
    not(target_arch = "wasm32")
))]

use stylus_sdk::alloy_primitives::{address, fixed_bytes, Address, FixedBytes, U256, U64};

use lib9lives::{
    actions::*, error::Error, fees::FEE_SCALING, host, immutables::*, implement_action,
    interactions_clear_after, maths, panic_guard, proxy, should_spend, should_spend_fusdc_contract,
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
        should_spend_fusdc_sender!(buy_amt, $c.add_liquidity_A_975_D_995(buy_amt, msg_sender()))
    };
}

proptest! {
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
    fn test_amm_simulate_swag(
        o in strat_uniq_outcomes(2, 2),
        mut c in strat_storage_trading(false)
    ) {
        interactions_clear_after! {
            IVAN => {
                setup_contract!(&mut c, &o);
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
        mut c in strat_storage_trading(false)
    )
    {
        // Test up to a thousand mint and burn operations from a hundred minimum.
        interactions_clear_after! {
            IVAN => {
                setup_contract!(&mut c, &outcomes);
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
                        let (q, _) = c.quote_C_0_E_17_F_C_7(m_out, m_u).unwrap();
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

#[test]
#[allow(non_snake_case)]
fn test_amm_reproduction_0x9d86E956d55e1AfDaC5910b581f7ec4322B65704_1640358() {
    let outcomes = [
        fixed_bytes!("2e141d56f374af10"),
        fixed_bytes!("e4e18b38e72765bb"),
        fixed_bytes!("ed90801f07c2f571"),
        fixed_bytes!("f8e1d8e326b6891d"),
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
            c.amm_liquidity.set(U256::from(10999997));
            c.amm_outcome_prices.setter(fixed_bytes!("2e141d56f374af10")).set(U256::from(178478));
            c.amm_outcome_prices.setter(fixed_bytes!("e4e18b38e72765bb")).set(U256::from(178478));
            c.amm_outcome_prices.setter(fixed_bytes!("ed90801f07c2f571")).set(U256::from(262336));
            c.amm_outcome_prices.setter(fixed_bytes!("f8e1d8e326b6891d")).set(U256::from(380706));
            c.amm_shares.setter(fixed_bytes!("2e141d56f374af10")).set(U256::from(14637339));
            c.amm_shares.setter(fixed_bytes!("e4e18b38e72765bb")).set(U256::from(14637339));
            c.amm_shares.setter(fixed_bytes!("ed90801f07c2f571")).set(U256::from(9958385));
            c.amm_shares.setter(fixed_bytes!("f8e1d8e326b6891d")).set(U256::from(6862101));
            c.amm_total_shares.setter(fixed_bytes!("2e141d56f374af10")).set(U256::from(21705727));
            c.amm_total_shares.setter(fixed_bytes!("e4e18b38e72765bb")).set(U256::from(21705727));
            c.amm_total_shares.setter(fixed_bytes!("ed90801f07c2f571")).set(U256::from(21705727));
            c.amm_total_shares.setter(fixed_bytes!("f8e1d8e326b6891d")).set(U256::from(21705727));
            c.amm_user_liquidity_shares.setter(msg_sender()).set(U256::from(11000000));
            c.amm_fees_collected_weighted.set(U256::from(0));
            c.amm_lp_global_fees_claimed.set(U256::from(0));
            c.amm_lp_user_fees_claimed.setter(msg_sender()).set(U256::from(0));

            let id = c.outcome_ids_iter().nth(3).unwrap();

            should_spend!(
                c.share_addr(id).unwrap(),
                { msg_sender() => 14842486 },
                Ok(should_spend_fusdc_contract!(
                    3489925,
                    c.burn_854_C_C_96_E(
                        id,
                        U256::from(14843000),
                        true,
                        U256::ZERO,
                        msg_sender(),
                        msg_sender()
                    )
                ))
            );
        }
    }
}

#[test]
#[allow(non_snake_case)]
fn test_amm_reproduction_0xbE42F0fb7C6e702be8C1DC11F04c7b5323bE93EE_1746439() {
    let outcomes = [
        fixed_bytes!("40b1a4e9694e8afe"),
        fixed_bytes!("f67ded74e0613d6b"),
    ];
    let users = [
        (
            address!("2654ddf31e5d8dda52fe8c1d759be186d316d8a6"),
            U256::from(2160845),
        ),
        (
            address!("529f786b6cc026ce88ee866a0de859283c216e50"),
            U256::from(11890776),
        ),
        (
            address!("4df958df0aaa3e861b15b494015bef446deea678"),
            U256::from(940738),
        ),
        (
            address!("991bbd55e19ca1ee7fc3932ca41ab4b0257f703a"),
            U256::from(1300296),
        ),
        (
            address!("3100bcb013490faf41f468062eda05907009906f"),
            U256::from(127172),
        ),
        (
            address!("38ce8d007f1f7431664bfdc526b30e52ec1f53ca"),
            U256::from(941779),
        ),
        (
            address!("20a1e9b0f535ddbfe442d415119bdb3d58dae037"),
            U256::from(5593743),
        ),
        (
            address!("988236e5a0a27c62124d131c2b8de67189532100"),
            U256::from(4826834),
        ),
        (
            address!("88769789657055e5629b758124f3bc52f218a2c5"),
            U256::from(11852232),
        ),
        (
            address!("2719e4c5f93224f02d7b0ca9f86894a98f49e21b"),
            U256::from(995590),
        ),
        (
            address!("c1269b5614c6f5cc50affa5e62d403622c6cdb3f"),
            U256::from(560),
        ),
        (
            address!("f753a9eadef94a2c993a733e6bbf78722ca1894d"),
            U256::from(940748),
        ),
        (
            address!("f882c1d73c9ec6d86858e349392e15d0d681b899"),
            U256::from(985683),
        ),
        (
            address!("c2f8de2c509c6d9c8430af6925481955f47df022"),
            U256::from(1024810),
        ),
        (
            address!("e0743df3aac45cc748adb6c5497bb522995dbb9e"),
            U256::from(731),
        ),
        (
            address!("e6db30da03905b00dcbe207513e1853b8323d5c1"),
            U256::from(1286118),
        ),
        (
            address!("9cc50f63fa3e29163e8a66fe9bf46d75d151c159"),
            U256::from(105028),
        ),
        (
            address!("b80e22cf18bb8891e264592c32c936c033e6e41c"),
            U256::from(1766384),
        ),
        (
            address!("d815e592f4effcf76b1f4b4eb823c19afd13b5db"),
            U256::from(102107),
        ),
        (
            address!("dc415ac0683544dd78865ab686ba53e778ec5630"),
            U256::from(101516200),
        ),
        (
            address!("ff36da79cf472a3d0d60f95561adce920514630f"),
            U256::from(102130),
        ),
    ];
    let lps = [
        (
            address!("dc415ac0683544dd78865ab686ba53e778ec5630"),
            U256::from(2252090),
        ),
        (
            address!("f753a9eadef94a2c993a733e6bbf78722ca1894d"),
            U256::from(243417),
        ),
        (
            address!("f882c1d73c9ec6d86858e349392e15d0d681b899"),
            U256::from(119654),
        ),
        (
            address!("38ce8d007f1f7431664bfdc526b30e52ec1f53ca"),
            U256::from(241290),
        ),
        (
            address!("529f786b6cc026ce88ee866a0de859283c216e50"),
            U256::from(119591),
        ),
        (
            address!("988236e5a0a27c62124d131c2b8de67189532100"),
            U256::from(930499),
        ),
        (
            address!("4df958df0aaa3e861b15b494015bef446deea678"),
            U256::from(243438),
        ),
    ];
    interactions_clear_after! {
        IVAN => {
            let mut c = StorageTrading::default();
            host::set_contract_address(address!("bE42F0fb7C6e702be8C1DC11F04c7b5323bE93EE"));
            setup_contract!(&mut c, &outcomes);
            c.factory_addr.set(address!("7dfe1fa7760131140cfc48b3ea99719203d8f00b"));
            c.share_impl.set(address!("3e27e934344bf490457231Cb8F0c0eda7d60C362"));
            c.amm_liquidity.set(U256::from(4149981));
            c.amm_outcome_prices.setter(fixed_bytes!("40b1a4e9694e8afe")).set(U256::from(14115));
            c.amm_outcome_prices.setter(fixed_bytes!("f67ded74e0613d6b")).set(U256::from(985884));
            c.amm_shares.setter(fixed_bytes!("40b1a4e9694e8afe")).set(U256::from(24292265));
            c.amm_shares.setter(fixed_bytes!("f67ded74e0613d6b")).set(U256::from(708965));
            c.amm_total_shares.setter(fixed_bytes!("40b1a4e9694e8afe")).set(U256::from(680427248));
            c.amm_total_shares.setter(fixed_bytes!("f67ded74e0613d6b")).set(U256::from(961237587));
            c.winner.set(fixed_bytes!("f67ded74e0613d6b"));
            c.when_decided.set(U64::from(1));
            host::set_block_timestamp(2);
            should_spend_fusdc_contract!(160300905, {
                for (addr, amt) in users {
                    host::set_msg_sender(addr);
                    should_spend!(
                        address!("f2cb56b265802a1f96ebd0ea169c7ffb35a19097"),
                        { addr => amt },
                        c.payoff_C_B_6_F_2565(c.winner.get(), amt, addr)
                    );
                }
                let mut total_lp_yield = U256::ZERO;
                for (addr, amt) in lps {
                    c.amm_user_liquidity_shares.setter(addr).set(amt);
                    host::set_msg_sender(addr);
                    // Remove liquidity collects all fees now.
                    total_lp_yield += c.remove_liquidity_3_C_857_A_15(U256::ZERO, addr).unwrap().1;
                }
                host::set_msg_sender(DAO_OP_ADDR);
                Ok(())
            });
        }
    }
}
