#![cfg(all(
    feature = "trading-backend-amm",
    feature = "testing",
    not(target_arch = "wasm32")
))]

use stylus_sdk::alloy_primitives::{FixedBytes, U256, U64};

use lib9lives::{
    actions::strat_action, assert_eq_u, host, implement_action, proxy, should_spend_fusdc_contract,
    should_spend_fusdc_sender, strat_storage_trading, testing_addrs::*, utils::*, StorageTrading,
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

proptest! {
    #[test]
    fn test_amm_erik_2(
        outcome_a in strat_fixed_bytes::<8>(),
        outcome_b in strat_fixed_bytes::<8>(),
        mut c in strat_storage_trading(false)
    ) {
        setup_contract(&mut c, &[outcome_a, outcome_b]);
        // 2% fee:
        let fee = 20;
        c.fee_lp.set(U256::from(fee));
        test_add_liquidity(&mut c, 1000e6 as u64);
        let mut acc = 0;
        for amt in [50, 75, 100, 25, 60] {
            let amt = amt * 1e6 as u64;
            acc += (amt * fee) / 1000;
            let amt = U256::from(amt);
            should_spend_fusdc_sender!(
                amt,
                c.mint_permit_E_90275_A_B(
                    outcome_a,
                    amt,
                    msg_sender(),
                    U256::ZERO,
                    0,
                    FixedBytes::ZERO,
                    FixedBytes::ZERO,
                )
            );
        }
        assert_eq!(6200000, acc);
        should_spend_fusdc_contract!(
            U256::from(acc),
            c.claim_lp_fees_66980_F_36(msg_sender())
        );
        assert_eq_u!(0, c.claim_lp_fees_66980_F_36(msg_sender()).unwrap());
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
