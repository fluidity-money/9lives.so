#![cfg(all(
    feature = "trading-backend-amm",
    feature = "testing",
    not(target_arch = "wasm32")
))]

use stylus_sdk::alloy_primitives::{Address, FixedBytes, U256, U64};

use lib9lives::{
    assert_eq_u, error::Error, fusdc_call, host, host_erc20_call, immutables::FUSDC_ADDR,
    interactions_clear_after, panic_guard, proxy, share_call, should_spend,
    should_spend_fusdc_contract, should_spend_fusdc_sender, strat_storage_trading,
    testing_addrs::*, utils::*, StorageTrading,
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
    for (i, o) in outcomes.iter().enumerate() {
        host::register_addr(
            proxy::get_share_addr(c.factory_addr.get(), CONTRACT, c.share_impl.get(), *o),
            format!("outcome share {o}, outcome id {i}"),
        );
    }
}

fn simulate_market_2(outcome_a: FixedBytes<8>, outcome_b: FixedBytes<8>, c: &mut StorageTrading) {
    // simulate_market_2 translation:
    setup_contract(c, &[outcome_a, outcome_b]);
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
                c.add_liquidity_638_E_B_2_C_9(liquidity_amt, IVAN, U256::ZERO)
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
        let (estimated_shares, fees_taken) = $c.quote_C_0_E_17_F_C_7($outcome, buy_amt).unwrap();
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
            let estimated_burned_shares = $c
                .estimate_burn_E_9_B_09_A_17($outcome, shares_sold).unwrap();
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
            assert_eq!(
                estimated_burned_shares,
                x,
                "inconsistent burned shares: {estimated_burned_shares} != {x}"
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
        mut c in strat_storage_trading(false)
    ) {
        let outcome_a = outcomes[0];
        let outcome_b = outcomes[1];
        // A binary outcome market example. Let's follow the scenario in
        // simulate_market_1.
        interactions_clear_after! {
            // Ivan goes to add $100 worth of liquidity...
            IVAN => {
                setup_contract(&mut c, &[outcome_a, outcome_b]);
                let liquidity_amt = U256::from(100e6 as u64);
                should_spend_fusdc_sender!(
                    liquidity_amt,
                    c.add_liquidity_638_E_B_2_C_9(liquidity_amt, IVAN, U256::ZERO)
                );
                /*assert_eq!(
                    U256::from(100e6 as u64),
                    c.amm_liquidity.get()
                ); */
                let liquidity_amt = U256::from(1000e6 as u64);
                should_spend_fusdc_sender!(
                    liquidity_amt,
                    c.add_liquidity_638_E_B_2_C_9(liquidity_amt, IVAN, U256::ZERO)
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
        mut c in strat_storage_trading(false)
    ) {
        let outcome_a = outcomes[0];
        let outcome_b = outcomes[1];
        interactions_clear_after! {
            IVAN => {
                simulate_market_2(outcome_a, outcome_b, &mut c);
            }
        }
    }

    #[test]
    fn test_amm_user_story_3(
        outcomes in strat_uniq_outcomes(4, 4),
        mut c in strat_storage_trading(false)
    ) {
        let outcome_a = outcomes[0];
        let outcome_b = outcomes[1];
        let outcome_c = outcomes[2];
        let outcome_d = outcomes[3];
        interactions_clear_after! {
            IVAN => {
                // simulate_market_3 translation:
                let outcomes = vec![outcome_a, outcome_b, outcome_c, outcome_d];
                setup_contract(&mut c, &outcomes);
                c.test_set_outcome_shares(1000e6 as u64, &[
                    (outcome_a, 461530000),  //461.53
                    (outcome_b, 1294000000), //1294
                    (outcome_c, 1294000000), //1294
                    (outcome_d, 1294000000), //1294
                ]);
                let liquidity_amt = U256::from(1000e6 as u64);
                should_spend_fusdc_sender!(
                    liquidity_amt,
                    c.add_liquidity_638_E_B_2_C_9(liquidity_amt, IVAN, U256::ZERO)
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
        mut c in strat_storage_trading(false)
    ) {
        let outcome_a = outcomes[0];
        let outcome_b = outcomes[1];
        interactions_clear_after! {
            IVAN => {
                simulate_market_2(outcome_a, outcome_b, &mut c);
                c.test_set_outcome_shares(5600e6 as u64, &[
                    (outcome_a, 357697e4 as u64),  //3578.97
                    (outcome_b, 876230e4 as u64), //8762.30
                ]);
                let remove_amt = c.amm_user_liquidity_shares.get(msg_sender());
                should_spend_fusdc_contract!(
                    // Less than 500.3415140438574, which is the reference.
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
                setup_contract(&mut c, &[outcome_a, outcome_b, outcome_c, outcome_d]);
                c.test_set_outcome_shares(1769680000 as u64, &[
                    (outcome_a, 812460000 as u64),  //812.46
                    (outcome_b, 2294000000 as u64), //2294
                    (outcome_c, 2294000000 as u64), //2294
                    (outcome_d, 2294000000 as u64), //2294
                ]);
                c.amm_user_liquidity_shares.setter(msg_sender()).set(U256::from(1000e6 as u64));
                let remove_amt = U256::from(300e6 as u64);
                should_spend_fusdc_contract!(
                    // 137.72998508204873
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
                setup_contract(&mut c, &[outcome_a, outcome_b]);
                // First, fund the contract with some fUSDC using add liquidity:
                test_add_liquidity!(&mut c, 1000e6 as u64);
                test_should_buy_check_shares!(
                    c,
                    outcome_a,
                    294e6 as u64,
                    772797528, // Market shares
                    521202472, // User shares
                    0 // Fees
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
                setup_contract(&mut c, &[outcome_a, outcome_b, outcome_c, outcome_d]);
                // First, fund the contract with some fUSDC using add liquidity:
                test_add_liquidity!(&mut c, 1000e6 as u64);
                test_should_buy_check_shares!(
                    c,
                    outcome_a,
                    294e6 as u64,
                    461527062, // Market shares
                    832472938, // User shares
                    0 // Fees
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
    fn test_amm_user_story_8(
        outcomes in strat_uniq_outcomes(4, 4),
        mut c in strat_storage_trading(false)
    ) {
        let outcome_a = outcomes[0];
        let outcome_b = outcomes[1];
        let outcome_c = outcomes[2];
        let outcome_d = outcomes[3];
        interactions_clear_after! {
            IVAN => {
                setup_contract(&mut c, &[outcome_a, outcome_b, outcome_c, outcome_d]);
                // First, fund the contract with some fUSDC using add liquidity:
                test_add_liquidity!(&mut c, 1000e6 as u64);
                c.internal_amm_get_prices().unwrap();
                let before_outcome_prices =
                    c.outcome_ids_iter().map(|x| c.amm_outcome_prices.get(x)).collect::<Vec<_>>();
                let before_shares =
                    c.outcome_ids_iter().map(|x| c.amm_shares.get(x)).collect::<Vec<_>>();
                let buy_amt = 300e6 as u64;
                test_should_buy_check_shares!(
                    c,
                    outcome_a,
                    buy_amt,
                    455166136, // Market shares
                    844833864, // User shares,
                    0 // Fees
                );
                let expect_usd = U256::from(844833173);
                let buy_amt = U256::from(buy_amt);
                test_should_burn_shares!(c, outcome_a, buy_amt, expect_usd, 0);
                for (i, (price1, price2)) in before_outcome_prices
                    .iter()
                    .zip(c.outcome_ids_iter().map(|x| c.amm_outcome_prices.get(x)))
                    .enumerate()
                {
                    assert_eq!(
                        *price1, price2,
                        "{i}: old price {price1} != new price {price2}"
                    );
                }
                for (i, (share1, share2)) in before_shares
                    .iter()
                    .zip(c.outcome_ids_iter().map(|x| c.amm_shares.get(x)))
                    .enumerate()
                {
                    assert_eq!(
                        *share1, share2,
                        "{i}: old shares {share1} != new shares {share2}",
                    );
                }
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
                setup_contract(&mut c, &[outcome_a, outcome_b]);
                // First, fund the contract with some fUSDC using add liquidity:
                let add_liq_amt = 1000e6 as u64;
                test_add_liquidity!(&mut c, add_liq_amt);
                let user_shares = 833333333u64;
                test_should_buy_check_shares!(
                    c,
                    outcome_a,
                    500e6 as u64,
                    666666667 as u64, // Market shares
                    user_shares, // User shares
                    0 // Fees
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
                setup_contract(&mut c, &[outcome_a, outcome_b, outcome_c, outcome_d]);
                // First, fund the contract with some fUSDC using add liquidity:
                let add_liq_amt = 1000e6 as u64;
                test_add_liquidity!(&mut c, add_liq_amt);
                let user_shares = test_should_buy_check_shares!(
                    c,
                    outcome_a,
                    200e6 as u64,
                    578703704, // Market shares
                    621296296, // User shares
                    0 // Fees
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
                setup_contract(&mut c, &[outcome_a, outcome_b, outcome_c, outcome_d]);
                let add_liq_amt = 1000e6 as u64;
                test_add_liquidity!(&mut c, add_liq_amt);
                let user_shares = 621296296;
                test_should_buy_check_shares!(
                    c,
                    outcome_a,
                    200e6 as u64,
                    578703704, // Market shares
                    user_shares, // User shares
                    0 // Fees
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
                setup_contract(&mut c, &[outcome_a, outcome_b, outcome_c, outcome_d]);
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
                setup_contract(&mut c, &outcomes);
                test_add_liquidity!(&mut c, 1000e6 as u64);
                test_should_buy_check_shares!(
                    c,
                    outcome_a,
                    1000e6 as u64,
                    125e6 as u64,
                    1875e6 as u64,
                    0 // No fees!
                );
                test_should_buy_check_shares!(
                    c,
                    outcome_b,
                    1000e6 as u64,
                    98765433,
                    2901234567u64,
                    0 // No fees
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
                setup_contract(&mut c, &outcomes);
                test_add_liquidity!(&mut c, 1000e6 as u64);
                test_should_buy_check_shares!(
                    c,
                    outcome_a,
                    1000e6 as u64,
                    125000000, // Market shares
                    1875000000, // User shares
                    0 // Fees
                );
                test_should_buy_check_shares!(
                    c,
                    outcome_b,
                    1000e6 as u64,
                    98765433, // Market shares
                    2901234567u64, // User shares
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
                setup_contract(&mut c, &[outcome_a, outcome_b]);
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
                setup_contract(&mut c, &[outcome_a, outcome_b]);
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
                setup_contract(&mut c, &[outcome_a, outcome_b, outcome_c, outcome_d]);
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
}
