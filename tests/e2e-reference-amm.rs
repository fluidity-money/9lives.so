#![cfg(all(
    feature = "trading-backend-amm",
    feature = "testing",
    not(target_arch = "wasm32")
))]

use stylus_sdk::alloy_primitives::{Address, FixedBytes, U256, U64};

use bobcat_features::BOBCAT_FEATURES;

use lib9lives::{
    assert_eq_u, error::Error, fusdc_call, host, host_erc20_call, immutables::FUSDC_ADDR,
    interactions_clear_after, panic_guard, proxy, share_call, should_spend,
    should_spend_fusdc_contract, should_spend_fusdc_sender, strat_storage_trading,
    testing_addrs::*, utils::*, StorageTrading,
};

use proptest::prelude::*;

BOBCAT_FEATURES!(shortterm_amm);

fn setup_contract(c: &mut StorageTrading, outcomes: &[FixedBytes<8>], starting_liq: U256) {
    c.created.set(false);
    c.is_protocol_fee_disabled.set(true);
    c.amm_liquidity.set(U256::ZERO);
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
        starting_liq,
    ))
    .unwrap();
    c.when_decided.set(U64::ZERO);
    c.is_shutdown.set(false);
    if starting_liq > U256::ZERO {
        feature_set_shortterm_amm(true);
    }
    for (i, o) in outcomes.iter().enumerate() {
        host::register_addr(
            proxy::get_share_addr(c.factory_addr.get(), CONTRACT, c.share_impl.get(), *o),
            format!("outcome share {o}, outcome id {i}"),
        );
    }
}

fn simulate_market_2(
    outcome_a: FixedBytes<8>,
    outcome_b: FixedBytes<8>,
    c: &mut StorageTrading,
    startup_liq: U256,
) {
    // simulate_market_2 translation:
    setup_contract(c, &[outcome_a, outcome_b], startup_liq);
    c.test_set_outcome_shares(
        1100e6 as u64,
        &[
            (outcome_a, 861170000),  //861.17,
            (outcome_b, 1405070000), //1405.07
        ],
    );
    let liquidity_amt = U256::from(1000e6 as u64);
    should_spend!(
        c.share_addr(outcome_a).unwrap(),
        { ZERO_FOR_MINT_ADDR => 387098718 },
        {
            should_spend_fusdc_sender!(
                liquidity_amt,
                c.add_liquidity_B_9_D_D_A_952(
                    liquidity_amt,
                    IVAN,
                    U256::ZERO,
                    U256::MAX
                )
            );
            Ok(())
        }
    );
    // Make sure we don't accidentally send to the incorrect id.
    assert_eq!(
        U256::ZERO,
        share_call::balance_of(c.share_addr(outcome_b).unwrap(), msg_sender()).unwrap()
    );
    assert_eq_u!(1882881997, c.amm_liquidity.get());
    assert_eq_u!(1474071282, c.amm_shares.get(outcome_a));
    assert_eq_u!(2405070000u64, c.amm_shares.get(outcome_b));
    assert_eq_u!(620000, c.amm_outcome_prices.get(outcome_a));
    assert_eq_u!(379999, c.amm_outcome_prices.get(outcome_b));
    assert_eq_u!(782881997, c.amm_user_liquidity_shares.get(msg_sender()));
}

macro_rules! test_add_liquidity {
    ($c:expr, $amt:expr) => {{
        let buy_amt = U256::from($amt);
        // Make sure we don't include fees that we didn't clean up.
        host_erc20_call::test_reset_bal(FUSDC_ADDR, CONTRACT);
        should_spend_fusdc_sender!(buy_amt, $c.add_liquidity_test(buy_amt, msg_sender()))
    }};
}

/// Test if a user can buy some shares, and do some balance accounting to
/// make sure. Doesn't check if the contract received the fees, only tries
/// to take it from them, and assumes the caller will do some accounting
/// to be certain.
macro_rules! test_should_buy_check_shares {
    (
        $c:ident,
        $outcome:expr,
        $buy_amt:expr,
        $market_share_amt:expr,
        $user_share_amt:expr,
        $fees_taken:expr
    ) => {{
        let buy_amt = U256::from($buy_amt);
        let user_share_amt = U256::from($user_share_amt);
        let (estimated_shares, fees_taken, _) = $c.quote_C_0_E_17_F_C_7($outcome, buy_amt).unwrap();
        host_erc20_call::test_reset_bal(FUSDC_ADDR, CONTRACT);
        assert_eq!(
            user_share_amt, estimated_shares,
            "quote amount of users shares diff"
        );
        let mut amount = U256::ZERO;
        assert_eq!(
            user_share_amt,
            // We can also test the quote function this way.
            should_spend_fusdc_sender!(buy_amt, {
                amount = $c
                    .mint_8_A_059_B_6_E($outcome, buy_amt, Address::ZERO, msg_sender())
                    .unwrap();
                assert_eq!(
                    U256::from($market_share_amt),
                    $c.amm_shares.get($outcome),
                    "market shares, buy amount is {buy_amt}"
                );
                host_erc20_call::burn(FUSDC_ADDR, CONTRACT, fees_taken);
                Ok(amount)
            }),
            "user shares"
        );
        amount
    }};
}

macro_rules! test_should_burn_shares {
    ($c:expr, $outcome:expr, $buy_amt:expr, $shares_sold:expr, $fees:expr) => {{
        let buy_amt = U256::from($buy_amt);
        let shares_sold = U256::from($shares_sold);
        let fees = U256::from($fees);
        host_erc20_call::test_reset_bal(FUSDC_ADDR, CONTRACT);
        // In this test scaffolding, we don't set the referrer.
        let a = should_spend_fusdc_contract!($buy_amt, {
            let estimated_usd = $c
                .estimate_burn_E_9_B_09_A_17($outcome, shares_sold)
                .unwrap();
            let (x, _) = $c
                .burn_854_C_C_96_E(
                    $outcome,
                    buy_amt,
                    false,
                    U256::ZERO,
                    Address::ZERO,
                    msg_sender(),
                )
                .unwrap();
            // We allow some tolerance with the mistake here due to the method.
            assert!(
                estimated_usd.abs_diff(buy_amt) <= U256::from(1000),
                "inconsistent estimated buy amounts: {estimated_usd} != {x}"
            );
            host_erc20_call::burn(FUSDC_ADDR, CONTRACT, fees);
            Ok(x)
        });
        assert!(
            U256::from(1000) >= shares_sold.abs_diff(a),
            "actual burn: {shares_sold} != {a}"
        );
    }};
}

proptest! {
    #[test]
    fn test_amm_user_story_1_a(
        outcomes in strat_uniq_outcomes(2, 2),
        mut c in strat_storage_trading(false),
    ) {
        let outcome_a = outcomes[0];
        let outcome_b = outcomes[1];
        interactions_clear_after! {
            IVAN => {
                setup_contract(&mut c, &[outcome_a, outcome_b], U256::ZERO);
                let liquidity_amt = U256::from(100e6 as u64);
                should_spend_fusdc_sender!(
                    liquidity_amt,
                    c.add_liquidity_B_9_D_D_A_952(
                        liquidity_amt,
                        IVAN,
                        U256::ZERO,
                        U256::MAX
                    )
                );
                let liquidity_amt = U256::from(1000e6 as u64);
                should_spend_fusdc_sender!(
                    liquidity_amt,
                    c.add_liquidity_B_9_D_D_A_952(
                        liquidity_amt,
                        IVAN,
                        U256::ZERO,
                        U256::MAX
                    )
                );
                assert_eq_u!(1100000000, c.amm_liquidity.get());
                assert_eq_u!(1100000000, c.amm_shares.get(outcome_a));
                assert_eq_u!(1100000000, c.amm_shares.get(outcome_b));
                assert_eq_u!(500000, c.amm_outcome_prices.get(outcome_a));
                assert_eq_u!(500000, c.amm_outcome_prices.get(outcome_b));
                assert_eq_u!(1100000000, c.amm_user_liquidity_shares.get(msg_sender()));
            },
        }
    }

    #[test]
    fn test_amm_user_story_2(
        outcomes in strat_uniq_outcomes(2, 2),
        mut c in strat_storage_trading(false),
    ) {
        let outcome_a = outcomes[0];
        let outcome_b = outcomes[1];
        interactions_clear_after! {
            IVAN => {
                simulate_market_2(outcome_a, outcome_b, &mut c, U256::ZERO);
                panic_guard(|| {
                    assert_eq!(
                        Error::ShorttermAmm,
                        c.burn_854_C_C_96_E(
                            outcome_a,
                            U256::from(100e6 as u64),
                            false,
                            U256::ZERO,
                            Address::ZERO,
                            msg_sender(),
                        ).unwrap_err()
                    );
                });
            }
        }
    }

    #[test]
    fn test_amm_user_story_3(
        outcomes in strat_uniq_outcomes(4, 4),
        mut c in strat_storage_trading(false),
    ) {
        let outcome_a = outcomes[0];
        let outcome_b = outcomes[1];
        let outcome_c = outcomes[2];
        let outcome_d = outcomes[3];
        interactions_clear_after! {
            IVAN => {
                let outcomes = vec![outcome_a, outcome_b, outcome_c, outcome_d];
                setup_contract(&mut c, &outcomes, U256::ZERO);
                c.test_set_outcome_shares(1000e6 as u64, &[
                    (outcome_a, 461530000),
                    (outcome_b, 1294000000),
                    (outcome_c, 1294000000),
                    (outcome_d, 1294000000),
                ]);
                let liquidity_amt = U256::from(1000e6 as u64);
                should_spend_fusdc_sender!(
                    liquidity_amt,
                    c.add_liquidity_B_9_D_D_A_952(
                        liquidity_amt,
                        IVAN,
                        U256::ZERO,
                        U256::MAX
                    )
                );
                assert_eq_u!(1772800379, c.amm_liquidity.get());
                assert_eq_u!(818199300, c.amm_shares.get(outcome_a));
                assert_eq_u!(2294000000u64, c.amm_shares.get(outcome_b));
                assert_eq_u!(2294000000u64, c.amm_shares.get(outcome_c));
                assert_eq_u!(2294000000u64, c.amm_shares.get(outcome_d));
                assert_eq_u!(483089, c.amm_outcome_prices.get(outcome_a));
                assert_eq_u!(172303, c.amm_outcome_prices.get(outcome_b));
                assert_eq_u!(172303, c.amm_outcome_prices.get(outcome_c));
                assert_eq_u!(172303, c.amm_outcome_prices.get(outcome_d));
                assert_eq_u!(772800379, c.amm_user_liquidity_shares.get(msg_sender()));
            },
        }
    }

    #[test]
    fn test_amm_user_story_4(
        outcomes in strat_uniq_outcomes(2, 2),
        mut c in strat_storage_trading(false),
    ) {
        let outcome_a = outcomes[0];
        let outcome_b = outcomes[1];
        interactions_clear_after! {
            IVAN => {
                simulate_market_2(outcome_a, outcome_b, &mut c, U256::ZERO);
                c.test_set_outcome_shares(5600e6 as u64, &[
                    (outcome_a, 357697e4 as u64),
                    (outcome_b, 876230e4 as u64),
                ]);
                let remove_amt = c.amm_user_liquidity_shares.get(msg_sender());
                should_spend_fusdc_contract!(
                    500061681,
                    {
                        let res = c.remove_liquidity_3_C_857_A_15(remove_amt, msg_sender()).unwrap();
                        assert_eq_u!(4815769830u64, c.amm_liquidity.get());
                        assert_eq_u!(3076908319u64, c.amm_shares.get(outcome_a));
                        assert_eq_u!(7537318847u64, c.amm_shares.get(outcome_b));
                        assert_eq_u!(710114, c.amm_outcome_prices.get(outcome_a));
                        assert_eq_u!(289885, c.amm_outcome_prices.get(outcome_b));
                        assert_eq_u!(0, c.amm_user_liquidity_shares.get(msg_sender()));
                        Ok(res)
                    }
                );
            }
        }
    }

    #[test]
    #[ignore]
    fn test_amm_user_story_5(
        outcomes in strat_uniq_outcomes(4, 4),
        mut c in strat_storage_trading(false)
    ) {
        let outcome_a = outcomes[0];
        let outcome_b = outcomes[1];
        let outcome_c = outcomes[2];
        let outcome_d = outcomes[3];
        interactions_clear_after! {
            IVAN => {
                setup_contract(&mut c, &[outcome_a, outcome_b, outcome_c, outcome_d], U256::ZERO);
                c.test_set_outcome_shares(1769680000 as u64, &[
                    (outcome_a, 812460000 as u64),
                    (outcome_b, 2294000000 as u64),
                    (outcome_c, 2294000000 as u64),
                    (outcome_d, 2294000000 as u64),
                ]);
                c.amm_user_liquidity_shares.setter(msg_sender()).set(U256::from(1000e6 as u64));
                let remove_amt = U256::from(300e6 as u64);
                should_spend_fusdc_contract!(
                    137729985,
                    {
                        let res = c.remove_liquidity_3_C_857_A_15(remove_amt, msg_sender()).unwrap();
                        assert_eq_u!(1469682744, c.amm_liquidity.get());
                        assert_eq_u!(674730015, c.amm_shares.get(outcome_a));
                        Ok(res)
                    }
                );
            }
        }
    }

    #[test]
    fn test_amm_user_story_6(
        outcomes in strat_uniq_outcomes(2, 2),
        mut c in strat_storage_trading(false)
    ) {
        let outcome_a = outcomes[0];
        let outcome_b = outcomes[1];
        interactions_clear_after! {
            IVAN => {
                setup_contract(&mut c, &[outcome_a, outcome_b], U256::ZERO);
                test_add_liquidity!(&mut c, 1000e6 as u64);
                test_should_buy_check_shares!(
                    c,
                    outcome_a,
                    294e6 as u64,
                    772797528,
                    521202472,
                    0
                );
                c.internal_amm_get_prices().unwrap();
                assert_eq_u!(1000e6, c.amm_liquidity.get());
                assert_eq_u!(772797528, c.amm_shares.get(outcome_a));
                assert_eq_u!(1294e6, c.amm_shares.get(outcome_b));
                assert_eq_u!(626089, c.amm_outcome_prices.get(outcome_a));
                assert_eq_u!(373910, c.amm_outcome_prices.get(outcome_b));
            }
        }
    }

    #[test]
    fn test_amm_user_story_7(
        outcomes in strat_uniq_outcomes(4, 4),
        mut c in strat_storage_trading(false)
    ) {
        let outcome_a = outcomes[0];
        let outcome_b = outcomes[1];
        let outcome_c = outcomes[2];
        let outcome_d = outcomes[3];
        interactions_clear_after! {
            IVAN => {
                setup_contract(&mut c, &[outcome_a, outcome_b, outcome_c, outcome_d], U256::ZERO);
                test_add_liquidity!(&mut c, 1000e6 as u64);
                test_should_buy_check_shares!(
                    c,
                    outcome_a,
                    294e6 as u64,
                    461527062,
                    832472938,
                    0
                );
                c.internal_amm_get_prices().unwrap();
                assert_eq_u!(1000e6, c.amm_liquidity.get());
                assert_eq_u!(461527062, c.amm_shares.get(outcome_a));
                assert_eq_u!(1294e6, c.amm_shares.get(outcome_b));
                assert_eq_u!(1294e6, c.amm_shares.get(outcome_c));
                assert_eq_u!(1294e6, c.amm_shares.get(outcome_d));
                assert_eq_u!(483091, c.amm_outcome_prices.get(outcome_a));
                assert_eq_u!(172302, c.amm_outcome_prices.get(outcome_b));
                assert_eq_u!(172302, c.amm_outcome_prices.get(outcome_c));
                assert_eq_u!(172302, c.amm_outcome_prices.get(outcome_d));
            }
        }
    }

    #[test]
    fn test_amm_user_story_9(
        outcomes in strat_uniq_outcomes(2, 2),
        mut c in strat_storage_trading(false)
    ) {
        let outcome_a = outcomes[0];
        let outcome_b = outcomes[1];
        interactions_clear_after! {
            IVAN => {
                setup_contract(&mut c, &[outcome_a, outcome_b], U256::ZERO);
                let add_liq_amt = 1000e6 as u64;
                test_add_liquidity!(&mut c, add_liq_amt);
                let user_shares = 833333333u64;
                test_should_buy_check_shares!(
                    c,
                    outcome_a,
                    500e6 as u64,
                    666666667 as u64,
                    user_shares,
                    0
                );
                host::set_block_timestamp(1);
                c.decide(outcome_a).unwrap();
                assert_eq!(U64::from(1), c.when_decided.get());
                should_spend_fusdc_contract!(
                    U256::from(user_shares),
                    c.payoff_C_B_6_F_2565(
                        outcome_a,
                        U256::from(user_shares),
                        msg_sender()
                    )
                );
                should_spend_fusdc_contract!(
                    666666000,
                    c.remove_liquidity_3_C_857_A_15(U256::ZERO, msg_sender())
                );
            }
        }
    }

    #[test]
    fn test_amm_user_story_10(
        outcomes in strat_uniq_outcomes(4, 4),
        mut c in strat_storage_trading(false)
    ) {
        let outcome_a = outcomes[0];
        let outcome_b = outcomes[1];
        let outcome_c = outcomes[2];
        let outcome_d = outcomes[3];
        interactions_clear_after! {
            IVAN => {
                setup_contract(&mut c, &[outcome_a, outcome_b, outcome_c, outcome_d], U256::ZERO);
                let add_liq_amt = 1000e6 as u64;
                test_add_liquidity!(&mut c, add_liq_amt);
                let user_shares = test_should_buy_check_shares!(
                    c,
                    outcome_a,
                    200e6 as u64,
                    578703704,
                    621296296,
                    0
                );
                host::set_block_timestamp(1);
                c.decide(outcome_a).unwrap();
                assert_eq!(U64::from(1), c.when_decided.get());
                host_erc20_call::test_reset_bal(FUSDC_ADDR, CONTRACT);
                should_spend_fusdc_contract!(
                    U256::from(user_shares),
                    c.payoff_C_B_6_F_2565(
                        outcome_a,
                        U256::from(user_shares),
                        msg_sender()
                    )
                );
                should_spend_fusdc_contract!(
                    U256::from(578703000),
                    c.remove_liquidity_3_C_857_A_15(U256::ZERO, msg_sender())
                );
            }
        }
    }

    #[test]
    fn test_amm_user_story_11(
        outcomes in strat_uniq_outcomes(4, 4),
        mut c in strat_storage_trading(false)
    ) {
        let outcome_a = outcomes[0];
        let outcome_b = outcomes[1];
        let outcome_c = outcomes[2];
        let outcome_d = outcomes[3];
        interactions_clear_after! {
            IVAN => {
                setup_contract(&mut c, &[outcome_a, outcome_b, outcome_c, outcome_d], U256::ZERO);
                let add_liq_amt = 1000e6 as u64;
                test_add_liquidity!(&mut c, add_liq_amt);
                let user_shares = 621296296;
                test_should_buy_check_shares!(
                    c,
                    outcome_a,
                    200e6 as u64,
                    578703704,
                    user_shares,
                    0
                );
                host::set_block_timestamp(1);
                c.decide(outcome_c).unwrap();
                panic_guard(||
                    assert_eq!(
                        Error::NotWinner,
                        c.payoff_C_B_6_F_2565(
                            outcome_a,
                            U256::from(user_shares),
                            msg_sender()
                        ).unwrap_err()
                    )
                );
                should_spend_fusdc_contract!(
                    U256::from(1200e6 as u64),
                    c.remove_liquidity_3_C_857_A_15(U256::ZERO, msg_sender())
                );
            }
        }
    }

    #[test]
    #[ignore]
    fn test_amm_user_story_12(
        outcomes in strat_uniq_outcomes(4, 4),
        mut c in strat_storage_trading(false)
    ) {
        let outcome_a = outcomes[0];
        let outcome_b = outcomes[1];
        let outcome_c = outcomes[2];
        let outcome_d = outcomes[3];
        interactions_clear_after! {
            IVAN => {
                setup_contract(&mut c, &[outcome_a, outcome_b, outcome_c, outcome_d], U256::ZERO);
                c.test_set_outcome_shares(
                    141421356 as u64,
                    &[
                        (outcome_a, 100e6 as u64),
                        (outcome_b, 100e6 as u64),
                        (outcome_c, 200e6 as u64),
                        (outcome_d, 200e6 as u64),
                    ],
                );
                c.amm_user_liquidity_shares.setter(msg_sender()).set(U256::from(10e6 as u64));
                let (_, _, shares) = should_spend_fusdc_contract!(
                    U256::from(3535533),
                    c.remove_liquidity_test(U256::from(5e6 as u64), msg_sender())
                );
                for (i, (_, s)) in shares.into_iter().enumerate() {
                    if i == 0 || i == 1 {
                        assert_eq!(U256::ZERO, s, "{i} inconsistent, expected 0. is {s}");
                    }
                    if i == 2 || i == 3 {
                        assert_eq!(U256::from(3534955), s, "{i} inconsistent, expected 3534955. is {s}");
                    }
                }
            }
        }
    }

    #[test]
    fn test_amm_user_story_13(
        outcomes in strat_uniq_outcomes(4, 4),
        mut c in strat_storage_trading(false)
    ) {
        let outcome_a = outcomes[0];
        let outcome_b = outcomes[1];
        interactions_clear_after! {
            IVAN => {
                setup_contract(&mut c, &outcomes, U256::ZERO);
                test_add_liquidity!(&mut c, 1000e6 as u64);
                test_should_buy_check_shares!(
                    c,
                    outcome_a,
                    1000e6 as u64,
                    125e6 as u64,
                    1875e6 as u64,
                    0
                );
                test_should_buy_check_shares!(
                    c,
                    outcome_b,
                    1000e6 as u64,
                    98765433,
                    2901234567u64,
                    0
                );
                let (_, shares) = test_add_liquidity!(&mut c, 500e6 as u64);
                for (i, (_, amt)) in shares.into_iter().enumerate() {
                    if i == 0 {
                        assert_eq!(U256::from(312505750u64), amt);
                    }
                    if i == 1 {
                        assert_eq!(U256::from(483540907), amt);
                    }
                    if i == 2 || i == 3 {
                        assert_eq!(U256::ZERO, amt);
                    }
                }
            }
        }
    }

    #[test]
    fn test_amm_user_story_14(
        outcomes in strat_uniq_outcomes(4, 4),
        mut c in strat_storage_trading(false)
    ) {
        let outcome_a = outcomes[0];
        let outcome_b = outcomes[1];
        interactions_clear_after! {
            IVAN => {
                setup_contract(&mut c, &outcomes, U256::ZERO);
                test_add_liquidity!(&mut c, 1000e6 as u64);
                test_should_buy_check_shares!(
                    c,
                    outcome_a,
                    1000e6 as u64,
                    125000000,
                    1875000000,
                    0
                );
                test_should_buy_check_shares!(
                    c,
                    outcome_b,
                    1000e6 as u64,
                    98765433,
                    2901234567u64,
                    0
                );
                test_add_liquidity!(&mut c, 500e6 as u64);
                //TODO
            }
        }
    }

    #[test]
    fn test_amm_user_story_16(
        outcomes in strat_uniq_outcomes(2, 2),
        mut c in strat_storage_trading(false)
    ) {
        let outcome_a = outcomes[0];
        let outcome_b = outcomes[1];
        interactions_clear_after! {
            IVAN => {
                setup_contract(&mut c, &[outcome_a, outcome_b], U256::ZERO);
                // 20 = 2% fees
                c.fee_lp.set(U256::from(20));
                test_add_liquidity!(&mut c, 1000e6 as u64);
                test_should_buy_check_shares!(
                    c,
                    outcome_a,
                    500e6 as u64,
                    671140940, // Market shares
                    818859060, // User shares
                    10e6 as u64 // Fees
                );
                assert_eq_u!(10e6 as u64, c.amm_fees_collected_weighted.get());
                test_should_burn_shares!(
                    c,
                    outcome_a,
                    100e6 as u64,
                    148283521,
                    2040817
                );
                assert_eq_u!(12040817 as u64, c.amm_fees_collected_weighted.get());
            }
        };
    }

    #[test]
    fn test_amm_user_story_17(
        outcomes in strat_uniq_outcomes(2, 2),
        mut c in strat_storage_trading(false)
    ) {
        let outcome_a = outcomes[0];
        let outcome_b = outcomes[1];
        let target_fee_collected = U256::from(12040817);
        let half_of_target_fee_collected = target_fee_collected / U256::from(2);
        interactions_clear_after! {
            IVAN => {
                setup_contract(&mut c, &[outcome_a, outcome_b], U256::ZERO);
                c.oracle.set(ELI);
                // 20 = 2% fees
                c.fee_lp.set(U256::from(20));
                test_add_liquidity!(&mut c, 500e6 as u64);
            },
            ERIK => {
                test_add_liquidity!(&mut c, 500e6 as u64);
            },
            ELI => {
                test_should_buy_check_shares!(
                    c,
                    outcome_a,
                    500e6 as u64,
                    671140940, // Market shares
                    818859060, // User shares
                    10e6 as u64 // Fees
                );
                assert_eq_u!(10e6 as u64, c.amm_fees_collected_weighted.get());
                test_should_burn_shares!(
                    c,
                    outcome_a,
                    100e6 as u64,
                    148283521,
                    2040817
                );
                // According to the Python, this should be 10000000.
                assert_eq!(target_fee_collected, c.amm_fees_collected_weighted.get());
            },
            IVAN => {
                should_spend_fusdc_contract!(
                    half_of_target_fee_collected,
                    c.claim_all_fees_332_D_7968(msg_sender())
                );
                assert_eq!(
                    U256::ZERO,
                    c.claim_all_fees_332_D_7968(msg_sender()).unwrap()
                );
            },
            ERIK => {
                should_spend_fusdc_contract!(
                    half_of_target_fee_collected,
                    c.claim_all_fees_332_D_7968(msg_sender())
                );
                assert_eq!(
                    U256::ZERO,
                    c.claim_all_fees_332_D_7968(msg_sender()).unwrap()
                );
                assert!(fusdc_call::balance_of(CONTRACT).unwrap().is_zero());
            },
            ELI => {
                // Since the check for whether the market has concluded is the time, we
                // need to set it to more than 0.
                host::set_block_timestamp(1);
                c.decide(outcome_a).unwrap();
                let win_amt = U256::from(667476901);
                should_spend_fusdc_contract!(
                    667476901,
                    c.payoff_C_B_6_F_2565(
                        outcome_a,
                        win_amt,
                        msg_sender()
                    )
                );
            },
            IVAN => {
                should_spend_fusdc_contract!(
                    359712000,
                     c.remove_liquidity_3_C_857_A_15(U256::ZERO, msg_sender())
                );
            },
            ERIK => {
                should_spend_fusdc_contract!(
                    359712000,
                    c.remove_liquidity_3_C_857_A_15(U256::ZERO, msg_sender())
                );
            }
        };
    }

    #[test]
    fn test_amm_user_story_18(
        outcomes in strat_uniq_outcomes(4, 4),
        mut c in strat_storage_trading(false)
    ) {
        let outcome_a = outcomes[0];
        let outcome_b = outcomes[1];
        let outcome_c = outcomes[2];
        let outcome_d = outcomes[3];
        let eli_shares: Option<Vec<(FixedBytes<8>, U256)>>;
        let ivan_liq_shares: Option<U256>;
        let ogous_shares: Option<U256>;
        interactions_clear_after! {
            IVAN => {
                setup_contract(&mut c, &[outcome_a, outcome_b, outcome_c, outcome_d], U256::ZERO);
                c.oracle.set(ELI);
                // 20 = 2% fees
                c.fee_lp.set(U256::from(20));
                let (liq_result, _) = test_add_liquidity!(&mut c, 500e6 as u64);
                ivan_liq_shares = Some(liq_result);
            },
            ERIK => {
                test_add_liquidity!(&mut c, 500e6 as u64);
            },
            OGOUS => {
                host_erc20_call::test_reset_bal(FUSDC_ADDR, CONTRACT);
                ogous_shares = Some(test_should_buy_check_shares!(
                    c,
                    outcome_a,
                    100e6 as u64,
                    755427830, // Market shares
                    342572170, // User shares
                    100e6 as u64 // Fees
                ));
                assert_eq_u!(342572170, ogous_shares.unwrap());
            },
            ELI => {
                assert_eq_u!(2e6 as u64, c.amm_fees_collected_weighted.get());
                let bal = 8000e6 as u64;
                let (_, liq_res) = test_add_liquidity!(&mut c, bal);
                eli_shares = Some(liq_res);
                assert_eq_u!(bal, fusdc_call::balance_of(CONTRACT).unwrap());
                host_erc20_call::test_reset_bal(FUSDC_ADDR, CONTRACT);
                // This is a dust amount, so zero.
                c.claim_all_fees_332_D_7968(msg_sender()).unwrap();
                assert_eq_u!(U256::ZERO, fusdc_call::balance_of(msg_sender()).unwrap());
            },
            IVAN => {
                should_spend_fusdc_contract!(
                    1e6 as u64,
                    c.claim_all_fees_332_D_7968(msg_sender())
                );
            },
            ERIK => {
                should_spend_fusdc_contract!(
                    1e6 as u64,
                    c.claim_all_fees_332_D_7968(msg_sender())
                );
            },
            ELI => {
                let (_, outcome_a_shares) = eli_shares.unwrap()[0];
                // In the reference, the shares are 2495.9721018075907:
                assert_eq_u!(2495972386u64, outcome_a_shares);
                panic_guard(|| {
                    assert_eq!(
                        Error::NotWinner,
                        c.payoff_C_B_6_F_2565(
                            outcome_a,
                            outcome_a_shares,
                            msg_sender()
                        ).unwrap_err()
                    );
                });
                host::set_block_timestamp(1);
                c.decide(outcome_a).unwrap();
                should_spend_fusdc_contract!(
                    outcome_a_shares,
                    c.payoff_C_B_6_F_2565(
                        outcome_a,
                        outcome_a_shares,
                        msg_sender()
                    )
                );
            },
            OGOUS => {
                should_spend_fusdc_contract!(
                    ogous_shares.unwrap(),
                    c.payoff_C_B_6_F_2565(
                        outcome_a,
                        ogous_shares.unwrap(),
                        msg_sender()
                    )
                );
            },
            IVAN => {
                assert_eq_u!(
                    ivan_liq_shares.unwrap(),
                    c.amm_user_liquidity_shares.get(msg_sender())
                );
                assert_eq_u!(500e6 as u64, ivan_liq_shares.unwrap());
                should_spend_fusdc_contract!(
                    // In the Python, this is 377.71391451345414:
                    377713500,
                    c.remove_liquidity_3_C_857_A_15(U256::ZERO, msg_sender())
                );
            },
            ERIK => should_spend_fusdc_contract!(
                // In the Python, this is 377.71391451345414:
                377713500,
                c.remove_liquidity_3_C_857_A_15(U256::ZERO, msg_sender())
            ),
            ELI => {
                should_spend_fusdc_contract!(
                    // In the Python, this is 5504.027898192409:
                    5504021786u64,
                    c.remove_liquidity_3_C_857_A_15(U256::ZERO, msg_sender())
                );
                assert_eq!(U256::ZERO, fusdc_call::balance_of(CONTRACT).unwrap());
            }
        };
    }

    #[test]
    fn test_shortterm_erik_example(
        outcomes in strat_uniq_outcomes(2, 2),
        mut c in strat_storage_trading(false)
    ) {
        let outcome_a = outcomes[0];
        let outcome_b = outcomes[1];
        let startup_liq = U256::from(10e6 as u64);
        interactions_clear_after! {
            IVAN => {
                setup_contract(&mut c, &[outcome_a, outcome_b], startup_liq);
                test_should_buy_check_shares!(
                    c,
                    outcome_a,
                    10e6,
                    166666,
                    1333334,
                    0
                );
            },
        }
    }
}
