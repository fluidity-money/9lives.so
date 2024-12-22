#![cfg(all(feature = "testing", not(target_arch = "wasm32")))]

use proptest::prelude::*;

use stylus_sdk::alloy_primitives::U256;

use lib9lives::{immutables::FUSDC_ADDR, should_spend, strat_storage_trading, utils::msg_sender};

proptest! {
    #[test]
    fn test_trading_should_take_fees(
        mut c in strat_storage_trading(false),
        spend_amt in any::<u64>(),
    ) {
        prop_assume!(c.outcome_list.len() > 0);
        let outcome = c.outcome_list.get(0).unwrap();
        let spend_amt = U256::from(spend_amt);
        should_spend!(
            FUSDC_ADDR,
            {msg_sender() => spend_amt},
            c.mint_test(outcome, spend_amt, msg_sender())
        );
    }
}
