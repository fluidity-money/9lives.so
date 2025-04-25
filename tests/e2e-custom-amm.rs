#![cfg(all(
    feature = "trading-backend-amm",
    feature = "testing",
    not(target_arch = "wasm32")
))]

use stylus_sdk::alloy_primitives::{FixedBytes, U256, U64};

use lib9lives::{
    actions::strat_action, host, implement_action, proxy, should_spend,
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
    fn test_amm_erik_1(
        outcome_a in strat_fixed_bytes::<8>(),
        outcome_b in strat_fixed_bytes::<8>(),
        mut c in strat_storage_trading(false)
    ) {
        setup_contract(&mut c, &[outcome_a, outcome_b]);
        c.amm_liquidity.set(U256::from(1000e6 as u64));
        test_should_buy_check_shares!(
            c,
            outcome_a,
            100e6 as u64,
            5000000000u64, // Market shares
            5100000000u64 // User shares
        );
        test_should_buy_check_shares!(
            c,
            outcome_b,
            100e6 as u64,
            196078431, // Market shares
            103921569 // User shares
        );
        should_spend!(
            c.share_addr(outcome_a).unwrap(),
            { CONTRACT => U256::from(100) },
            {
                should_spend_fusdc_contract!(
                    U256::from(100e6),
                    c.burn(outcome_a, U256::from(30e6), U256::ZERO, msg_sender())
                );
                Ok(())
            }
        )
    }

    #[test]
    fn test_amm_crazy_testing_1(
        outcomes in proptest::collection::vec(strat_fixed_bytes::<8>(), 2..100),
        mut c in strat_storage_trading(false),
        actions in proptest::collection::vec((strat_address(), strat_action()), 1..1000)
    ) {
        setup_contract(&mut c, &outcomes);
        for (sender, a) in actions {
            implement_action!(c, sender, a);
        }
    }
}
