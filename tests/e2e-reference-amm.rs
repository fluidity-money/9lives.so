#![cfg(all(
    feature = "trading-backend-amm",
    feature = "testing",
    not(target_arch = "wasm32")
))]

use stylus_sdk::alloy_primitives::{FixedBytes, U256, U64};

use lib9lives::{
    assert_eq_u, error::Error, host, interactions_clear_after, panic_guard, proxy,
    should_spend_fusdc_contract, should_spend_fusdc_sender, strat_storage_trading,
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
    should_spend_fusdc_sender!(
        liquidity_amt,
        c.add_liquidity_permit(
            liquidity_amt,
            IVAN,
            U256::ZERO,
            0,
            FixedBytes::<32>::ZERO,
            FixedBytes::<32>::ZERO
        )
    );
    assert_eq_u!(1882881998, c.amm_liquidity.get());
    assert_eq_u!(1474071283, c.amm_shares.get(outcome_a));
    assert_eq_u!(2405070000u64, c.amm_shares.get(outcome_b));
    assert_eq_u!(620000, c.amm_outcome_prices.get(outcome_a));
    assert_eq_u!(379999, c.amm_outcome_prices.get(outcome_b));
    assert_eq_u!(782881998, c.amm_user_liquidity_shares.get(msg_sender()));
}

fn test_add_liquidity(c: &mut StorageTrading, amt: u64) -> (U256, Vec<(FixedBytes<8>, U256)>) {
    let buy_amt = U256::from(amt);
    should_spend_fusdc_sender!(
        buy_amt,
        c.add_liquidity_permit(
            buy_amt,
            msg_sender(),
            U256::ZERO,
            0,
            FixedBytes::<32>::ZERO,
            FixedBytes::<32>::ZERO
        )
    )
}

macro_rules! test_should_buy_check_shares {
    ($c:ident, $outcome:expr, $buy_amt:expr, $market_share_amt:expr, $user_share_amt:expr) => {{
        let buy_amt = U256::from($buy_amt);
        assert_eq!(
            U256::from($user_share_amt),
            should_spend_fusdc_sender!(buy_amt, {
                let amount = $c
                    .mint_permit_E_90275_A_B(
                        $outcome,
                        buy_amt,
                        msg_sender(),
                        U256::ZERO,
                        0,
                        FixedBytes::ZERO,
                        FixedBytes::ZERO,
                    )
                    .unwrap();
                assert_eq!(
                    U256::from($market_share_amt),
                    $c.amm_shares.get($outcome),
                    "market shares"
                );
                Ok(amount)
            }),
            "user shares"
        )
    }};
}

proptest! {
    #[test]
    fn test_amm_user_story_1(
        outcome_a in strat_fixed_bytes::<8>(),
        outcome_b in strat_fixed_bytes::<8>(),
        mut c in strat_storage_trading(false)
    ) {
        // A binary outcome market example. Let's follow the scenario in
        // simulate_market_1.
        interactions_clear_after! {
            // Ivan goes to add $100 worth of liquidity...
            IVAN => {
                setup_contract(&mut c, &[outcome_a, outcome_b]);
                let liquidity_amt = U256::from(100e6 as u64);
                should_spend_fusdc_sender!(
                    liquidity_amt,
                    c.add_liquidity_permit(
                        liquidity_amt,
                        IVAN,
                        U256::ZERO,
                        0,
                        FixedBytes::<32>::ZERO,
                        FixedBytes::<32>::ZERO
                    )
                );
                assert_eq!(
                    U256::from(100e6 as u64),
                    c.amm_liquidity.get()
                );
                let liquidity_amt = U256::from(1000e6 as u64);
                should_spend_fusdc_sender!(
                    liquidity_amt,
                    c.add_liquidity_permit(
                        liquidity_amt,
                        IVAN,
                        U256::ZERO,
                        0,
                        FixedBytes::<32>::ZERO,
                        FixedBytes::<32>::ZERO
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
        outcome_a in strat_fixed_bytes::<8>(),
        outcome_b in strat_fixed_bytes::<8>(),
        mut c in strat_storage_trading(false)
    ) {
        interactions_clear_after! {
            IVAN => {
                simulate_market_2(outcome_a, outcome_b, &mut c);
            }
        }
    }

    #[test]
    fn test_amm_user_story_3(
        outcome_a in strat_fixed_bytes::<8>(),
        outcome_b in strat_fixed_bytes::<8>(),
        outcome_c in strat_fixed_bytes::<8>(),
        outcome_d in strat_fixed_bytes::<8>(),
        mut c in strat_storage_trading(false)
    ) {
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
                    c.add_liquidity_permit(
                        liquidity_amt,
                        IVAN,
                        U256::ZERO,
                        0,
                        FixedBytes::<32>::ZERO,
                        FixedBytes::<32>::ZERO
                    )
                );
                assert_eq_u!(1772800380, c.amm_liquidity.get());
                assert_eq_u!(818199301, c.amm_shares.get(outcome_a));
                assert_eq_u!(2294000000u64, c.amm_shares.get(outcome_b));
                assert_eq_u!(2294000000u64, c.amm_shares.get(outcome_c));
                assert_eq_u!(2294000000u64, c.amm_shares.get(outcome_d));
                assert_eq_u!(483089, c.amm_outcome_prices.get(outcome_a));
                assert_eq_u!(172303, c.amm_outcome_prices.get(outcome_b));
                assert_eq_u!(172303, c.amm_outcome_prices.get(outcome_c));
                assert_eq_u!(172303, c.amm_outcome_prices.get(outcome_d));
                assert_eq_u!(772800380, c.amm_user_liquidity_shares.get(msg_sender()));
            },
        }
    }

    #[test]
    fn test_amm_user_story_4(
        outcome_a in strat_fixed_bytes::<8>(),
        outcome_b in strat_fixed_bytes::<8>(),
        mut c in strat_storage_trading(false)
    ) {
        interactions_clear_after! {
            IVAN => {
                simulate_market_2(outcome_a, outcome_b, &mut c);
                c.test_set_outcome_shares(5600e6 as u64, &[
                    (outcome_a, 357697e4 as u64),  //3578.97
                    (outcome_b, 876230e4 as u64), //8762.30
                ]);
                let remove_amt = c.amm_user_liquidity_shares.get(msg_sender());
                should_spend_fusdc_contract!(
                    remove_amt,
                    {
                        let res = c.remove_liquidity_3_C_857_A_15(remove_amt, msg_sender()).unwrap();
                        assert_eq_u!(4815769827u64, c.amm_liquidity.get());
                        assert_eq_u!(3076908317u64, c.amm_shares.get(outcome_a));
                        assert_eq_u!(7537318843u64, c.amm_shares.get(outcome_b));
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
    fn test_amm_user_story_5(
        outcome_a in strat_fixed_bytes::<8>(),
        outcome_b in strat_fixed_bytes::<8>(),
        outcome_c in strat_fixed_bytes::<8>(),
        outcome_d in strat_fixed_bytes::<8>(),
        mut c in strat_storage_trading(false)
    ) {
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
                let res = should_spend_fusdc_contract!(
                    remove_amt,
                    {
                        let res = c.remove_liquidity_3_C_857_A_15(remove_amt, msg_sender()).unwrap();
                        assert_eq_u!(1469682742, c.amm_liquidity.get());
                        assert_eq_u!(674730014, c.amm_shares.get(outcome_a));
                        // TODO
                        Ok(res)
                    }
                );
                dbg!(res);
            }
        }
    }

    #[test]
    fn test_amm_user_story_6(
        outcome_a in strat_fixed_bytes::<8>(),
        outcome_b in strat_fixed_bytes::<8>(),
        mut c in strat_storage_trading(false)
    ) {
        interactions_clear_after! {
            IVAN => {
                setup_contract(&mut c, &[outcome_a, outcome_b]);
                // First, fund the contract with some fUSDC using add liquidity:
                test_add_liquidity(&mut c, 1000e6 as u64);
                test_should_buy_check_shares!(
                    c,
                    outcome_a,
                    294e6 as u64,
                    772797527, // Market shares
                    521202473 // User shares
                );
                c.internal_amm_get_prices().unwrap();
                assert_eq_u!(1000e6, c.amm_liquidity.get());
                assert_eq_u!(772797527, c.amm_shares.get(outcome_a));
                assert_eq_u!(1294e6, c.amm_shares.get(outcome_b));
                assert_eq_u!(626089, c.amm_outcome_prices.get(outcome_a));
                assert_eq_u!(373910, c.amm_outcome_prices.get(outcome_b));
            }
        }
    }

    #[test]
    fn test_amm_user_story_7(
        outcome_a in strat_fixed_bytes::<8>(),
        outcome_b in strat_fixed_bytes::<8>(),
        outcome_c in strat_fixed_bytes::<8>(),
        outcome_d in strat_fixed_bytes::<8>(),
        mut c in strat_storage_trading(false)
    ) {
        interactions_clear_after! {
            IVAN => {
                setup_contract(&mut c, &[outcome_a, outcome_b, outcome_c, outcome_d]);
                // First, fund the contract with some fUSDC using add liquidity:
                test_add_liquidity(&mut c, 1000e6 as u64);
                test_should_buy_check_shares!(
                    c,
                    outcome_a,
                    294e6 as u64,
                    461527061, // Market shares
                    832472939 // User shares
                );
                c.internal_amm_get_prices().unwrap();
                assert_eq_u!(1000e6, c.amm_liquidity.get());
                assert_eq_u!(461527061, c.amm_shares.get(outcome_a));
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
        outcome_a in strat_fixed_bytes::<8>(),
        outcome_b in strat_fixed_bytes::<8>(),
        outcome_c in strat_fixed_bytes::<8>(),
        outcome_d in strat_fixed_bytes::<8>(),
        mut c in strat_storage_trading(false)
    ) {
        interactions_clear_after! {
            IVAN => {
                setup_contract(&mut c, &[outcome_a, outcome_b, outcome_c, outcome_d]);
                // First, fund the contract with some fUSDC using add liquidity:
                test_add_liquidity(&mut c, 1000e6 as u64);
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
                    455166135, // Market shares
                    844833865 // User shares
                );
                assert_eq_u!(
                    844833865,
                    should_spend_fusdc_contract!(
                        U256::from(buy_amt),
                        c.burn_A_E_5853_F_A(
                            outcome_a,
                            U256::from(buy_amt),
                            U256::ZERO,
                            msg_sender()
                        )
                    )
                );
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
        outcome_a in strat_fixed_bytes::<8>(),
        outcome_b in strat_fixed_bytes::<8>(),
        mut c in strat_storage_trading(false)
    ) {
        interactions_clear_after! {
            IVAN => {
                setup_contract(&mut c, &[outcome_a, outcome_b]);
                // First, fund the contract with some fUSDC using add liquidity:
                let add_liq_amt = 1000e6 as u64;
                test_add_liquidity(&mut c, add_liq_amt);
                let user_shares = 833333334u64;
                test_should_buy_check_shares!(
                    c,
                    outcome_a,
                    500e6 as u64,
                    666666666u64, // Market shares
                    user_shares // User shares
                );
                host::set_block_timestamp(1);
                c.decide(outcome_a).unwrap();
                should_spend_fusdc_contract!(
                    U256::from(user_shares),
                    c.payoff_91_F_A_8_C_2_E(
                        outcome_a,
                        U256::from(user_shares),
                        msg_sender()
                    )
                );
                should_spend_fusdc_contract!(
                    U256::from(add_liq_amt),
                    c.claim_liquidity_9_C_391_F_85(msg_sender())
                );
            }
        }
    }

    #[test]
    fn test_amm_user_story_10(
        outcome_a in strat_fixed_bytes::<8>(),
        outcome_b in strat_fixed_bytes::<8>(),
        mut c in strat_storage_trading(false)
    ) {
        interactions_clear_after! {
            IVAN => {
                setup_contract(&mut c, &[outcome_a, outcome_b]);
                // First, fund the contract with some fUSDC using add liquidity:
                let add_liq_amt = 1000e6 as u64;
                test_add_liquidity(&mut c, add_liq_amt);
                let user_shares = 833333334u64;
                test_should_buy_check_shares!(
                    c,
                    outcome_a,
                    500e6 as u64,
                    666666666, // Market shares
                    user_shares // User shares
                );
                host::set_block_timestamp(1);
                c.decide(outcome_a).unwrap();
                should_spend_fusdc_contract!(
                    U256::from(user_shares),
                    c.payoff_91_F_A_8_C_2_E(
                        outcome_a,
                        U256::from(user_shares),
                        msg_sender()
                    )
                );
                should_spend_fusdc_contract!(
                    U256::from(add_liq_amt),
                    c.claim_liquidity_9_C_391_F_85(msg_sender())
                );
            }
        }
    }

    #[test]
    fn test_amm_user_story_11(
        outcome_a in strat_fixed_bytes::<8>(),
        outcome_b in strat_fixed_bytes::<8>(),
        outcome_c in strat_fixed_bytes::<8>(),
        outcome_d in strat_fixed_bytes::<8>(),
        mut c in strat_storage_trading(false)
    ) {
        interactions_clear_after! {
            IVAN => {
                setup_contract(&mut c, &[outcome_a, outcome_b, outcome_c, outcome_d]);
                let add_liq_amt = 1000e6 as u64;
                test_add_liquidity(&mut c, add_liq_amt);
                let user_shares = 621296297;
                test_should_buy_check_shares!(
                    c,
                    outcome_a,
                    200e6 as u64,
                    578703703, // Market shares
                    user_shares // User shares
                );
                host::set_block_timestamp(1);
                c.decide(outcome_c).unwrap();
                panic_guard(||
                    assert_eq!(
                        Error::NotWinner,
                        c.payoff_91_F_A_8_C_2_E(
                            outcome_a,
                            U256::from(user_shares),
                            msg_sender()
                        ).unwrap_err()
                    )
                );
                should_spend_fusdc_contract!(
                    U256::from(add_liq_amt),
                    c.claim_liquidity_9_C_391_F_85(msg_sender())
                );
            }
        }
    }

    #[test]
    fn test_amm_user_story_12(
        outcome_a in strat_fixed_bytes::<8>(),
        outcome_b in strat_fixed_bytes::<8>(),
        outcome_c in strat_fixed_bytes::<8>(),
        outcome_d in strat_fixed_bytes::<8>(),
        mut c in strat_storage_trading(false)
    ) {
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
                let (_, shares) = should_spend_fusdc_contract!(
                    U256::from(3535534),
                    c.remove_liquidity_3_C_857_A_15(U256::from(5e6 as u64), msg_sender())
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
        outcome_a in strat_fixed_bytes::<8>(),
        outcome_b in strat_fixed_bytes::<8>(),
        outcome_c in strat_fixed_bytes::<8>(),
        outcome_d in strat_fixed_bytes::<8>(),
        mut c in strat_storage_trading(false)
    ) {
        interactions_clear_after! {
            IVAN => {
                setup_contract(&mut c, &[outcome_a, outcome_b, outcome_c, outcome_d]);
                test_add_liquidity(&mut c, 1000e6 as u64);
                test_should_buy_check_shares!(
                    c,
                    outcome_a,
                    1000e6 as u64,
                    125e6 as u64,
                    1875e6 as u64
                );
                test_should_buy_check_shares!(
                    c,
                    outcome_b,
                    1000e6 as u64,
                    98765432,
                    2901234568u64
                );
                let (_, shares) = test_add_liquidity(&mut c, 500e6 as u64);
                for (i, (_, amt)) in shares.into_iter().enumerate() {
                    if i == 0 {
                        assert_eq!(U256::from(312505749u64), amt);
                    }
                    if i == 1 {
                        assert_eq!(U256::from(483540905), amt);
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
        outcome_a in strat_fixed_bytes::<8>(),
        outcome_b in strat_fixed_bytes::<8>(),
        outcome_c in strat_fixed_bytes::<8>(),
        outcome_d in strat_fixed_bytes::<8>(),
        mut c in strat_storage_trading(false)
    ) {
        interactions_clear_after! {
            IVAN => {
                setup_contract(&mut c, &[outcome_a, outcome_b, outcome_c, outcome_d]);
                test_add_liquidity(&mut c, 100e6 as u64);
                test_should_buy_check_shares!(
                    c,
                    outcome_a,
                    1000e6 as u64,
                    75131, // Market shares
                    1099924869 // User shares
                );
                test_should_buy_check_shares!(
                    c,
                    outcome_b,
                    1000e6 as u64,
                    22674, // Market shares
                    2099977326 // User shares
                );
                test_add_liquidity(&mut c, 500e6 as u64);
                //TODO
            }
        }
    }

    #[test]
    fn test_amm_user_story_15(
        outcome_a in strat_fixed_bytes::<8>(),
        outcome_b in strat_fixed_bytes::<8>(),
        outcome_c in strat_fixed_bytes::<8>(),
        outcome_d in strat_fixed_bytes::<8>(),
        mut c in strat_storage_trading(false)
    ) {
        interactions_clear_after! {
            IVAN => {
                setup_contract(&mut c, &[outcome_a, outcome_b, outcome_c, outcome_d]);
                test_add_liquidity(&mut c, 1000e6 as u64);
                test_should_buy_check_shares!(
                    c,
                    outcome_a,
                    300e6 as u64,
                    455166135, // Market shares
                    844833865 // User shares
                );
                let (shares, _) = test_add_liquidity(&mut c, 500e6 as u64);
                assert_eq_u!(384615631, shares);
                should_spend_fusdc_contract!(
                    U256::from(455166379),
                    c.remove_liquidity_3_C_857_A_15(shares, msg_sender())
                );
                let remove_liq_amt = U256::from(1000e6 as u64);
                c.amm_liquidity.set(remove_liq_amt);
                should_spend_fusdc_contract!(
                    U256::from(455166379),
                    c.remove_liquidity_3_C_857_A_15(remove_liq_amt, msg_sender())
                );
                assert_eq!(U256::ZERO, c.amm_liquidity.get());
                c.decide(outcome_a).unwrap();
                let fusdc_amt = U256::from(1169769966);
                should_spend_fusdc_contract!(
                    fusdc_amt,
                    c.payoff_91_F_A_8_C_2_E(
                        outcome_a,
                        fusdc_amt,
                        msg_sender()
                    )
                )
            }
        }
    }
}
