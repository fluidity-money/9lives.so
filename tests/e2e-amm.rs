#![cfg(all(
    feature = "trading-backend-amm",
    feature = "testing",
    not(target_arch = "wasm32")
))]

use stylus_sdk::alloy_primitives::{FixedBytes, U256};

use lib9lives::{
    assert_eq_u, assert_eq_u_down, immutables::*, interactions_clear_after, should_spend,
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
        DAO_ADDR,
        SHARE,
        false,
        0,
        0,
        0,
    )
    .unwrap();
    c.amm_liquidity.set(U256::ZERO);
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
        msg_sender(),
        { c.share_addr(outcome_a).unwrap() => U256::from(387100000000000u64) },
        {
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
            Ok(())
        }
    );
    assert_eq_u!(1882882359, c.amm_liquidity.get());
    assert_eq!(U256::from(1474071848u64), c.amm_shares.get(outcome_a));
    assert_eq!(U256::from(2405070000u64), c.amm_shares.get(outcome_b));
    assert_eq_u_down!(6200, c.amm_outcome_prices.get(outcome_a));
    assert_eq_u_down!(3799, c.amm_outcome_prices.get(outcome_b));
    assert_eq!(
        U256::from(782882359),
        c.amm_user_liquidity_shares.get(msg_sender())
    );
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
        setup_contract(&mut c, &[outcome_a, outcome_b]);
        interactions_clear_after! {
            // Ivan goes to add $100 worth of liquidity...
            IVAN => {
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
                assert_eq_u_down!(11, c.amm_liquidity.get());
                assert_eq_u_down!(11, c.amm_shares.get(outcome_a));
                assert_eq_u!(1100000000, c.amm_shares.get(outcome_b));
                assert_eq_u_down!(5000, c.amm_outcome_prices.get(outcome_a));
                assert_eq_u_down!(5000, c.amm_outcome_prices.get(outcome_b));
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
        // simulate_market_3 translation:
        let outcomes = vec![outcome_a, outcome_b, outcome_c, outcome_d];
        setup_contract(&mut c, &outcomes);
        c.test_set_outcome_shares(1000e6 as u64, &[
            (outcome_a, 461530000),  //461.53
            (outcome_b, 1294000000), //1294
            (outcome_c, 1294000000), //1294
            (outcome_d, 1294000000), //1294
        ]);
        interactions_clear_after! {
            IVAN => {
                let liquidity_amt = U256::from(1000e6 as u64);
                should_spend!(
                    msg_sender(),
                    { c.share_addr(outcome_a).unwrap() => U256::from(649070000000000u64) },
                    {
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
                        Ok(())
                    }
                );
                assert_eq_u!(1772800348, c.amm_liquidity.get());
                assert_eq_u!(818199242, c.amm_shares.get(outcome_a));
                assert_eq_u!(2294000000u64, c.amm_shares.get(outcome_b));
                assert_eq_u!(2294000000u64, c.amm_shares.get(outcome_c));
                assert_eq_u!(2294000000u64, c.amm_shares.get(outcome_d));
                assert_eq_u_down!(4830, c.amm_outcome_prices.get(outcome_a));
                assert_eq_u_down!(1723, c.amm_outcome_prices.get(outcome_b));
                assert_eq_u_down!(1723, c.amm_outcome_prices.get(outcome_c));
                assert_eq_u_down!(1723, c.amm_outcome_prices.get(outcome_d));
                assert_eq_u!(76968, c.amm_user_liquidity_shares.get(msg_sender()));
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
                should_spend!(
                    CONTRACT,
                    {
                        c.share_addr(outcome_a).unwrap() => U256::from(387),
                        c.share_addr(outcome_b).unwrap() => U256::from(1998)
                    },
                    {
                        should_spend_fusdc_contract!(
                            remove_amt,
                            {
                                c.remove_liquidity(remove_amt, msg_sender()).unwrap();
                                assert_eq_u_down!(49, c.amm_liquidity.get());
                                //TODO
                                assert_eq_u!(3078629, c.amm_shares.get(outcome_a));
                                assert_eq_u!(753733, c.amm_shares.get(outcome_b));
                                assert_eq_u_down!(7100, c.amm_outcome_prices.get(outcome_a));
                                assert_eq_u_down!(2900, c.amm_outcome_prices.get(outcome_b));
                                assert_eq_u!(0, c.amm_user_liquidity_shares.get(msg_sender()));
                                Ok(())
                            }
                        );
                        Ok(())
                    }
                );
            }
        }
    }

    #[test]
    fn test_amm_user_story_5(
        outcome_a in strat_fixed_bytes::<8>(),
        outcome_b in strat_fixed_bytes::<8>(),
        mut c in strat_storage_trading(false)
    ) {
        setup_contract(&mut c, &[outcome_a, outcome_b]);
        interactions_clear_after! {
            IVAN => {
                c.test_set_outcome_shares(5600e6 as u64, &[
                    (outcome_a, 357697e4 as u64),  //3578.97
                    (outcome_b, 876230e4 as u64), //8762.30
                ]);
                let remove_amt = c.amm_user_liquidity_shares.get(msg_sender());
                should_spend!(
                    CONTRACT,
                    {
                        c.share_addr(outcome_a).unwrap() => U256::from(387),
                        c.share_addr(outcome_b).unwrap() => U256::from(1998)
                    },
                    {
                        should_spend_fusdc_contract!(
                            remove_amt,
                            {
                                c.remove_liquidity(remove_amt, msg_sender()).unwrap();
                                assert_eq_u!(4947992940u64, c.amm_liquidity.get());
                                assert_eq_u!(3078629, c.amm_shares.get(outcome_a));
                                assert_eq_u!(753733, c.amm_shares.get(outcome_b));
                                assert_eq_u_down!(7100, c.amm_outcome_prices.get(outcome_a));
                                assert_eq_u_down!(2900, c.amm_outcome_prices.get(outcome_b));
                                assert_eq_u!(0, c.amm_user_liquidity_shares.get(msg_sender()));
                                Ok(())
                            }
                        );
                        Ok(())
                    }
                );
            }
        }
    }

    #[test]
    fn test_amm_user_story_6(
        outcome_a in strat_fixed_bytes::<8>(),
        outcome_b in strat_fixed_bytes::<8>(),
        mut c in strat_storage_trading(false)
    ) {
        setup_contract(&mut c, &[outcome_a, outcome_b]);
        interactions_clear_after! {
            IVAN => {
                let amt_usd = U256::from(1294e6 as u64);
                c.mint_permit_E_90275_A_B(
                    outcome_a,
                    amt_usd,
                    msg_sender(),
                    U256::ZERO,
                    0,
                    FixedBytes::<32>::ZERO,
                    FixedBytes::<32>::ZERO
                )
                    .unwrap();
            }
        }
    }
}
