#![cfg(all(feature = "testing", not(target_arch = "wasm32")))]

use lib9lives::host;

use stylus_sdk::{
    alloy_primitives::{FixedBytes, U256},
    msg, block,
};

use proptest::{
    collection::{self, VecStrategy},
    prelude::*,
    strategy::Strategy,
};

// 100 million USD
const REASONABLE_UPPER_AMT: u128 = 100_000_000 * 1e6 as u128;

#[derive(Debug, Clone, PartialEq)]
enum Outcome {
    Outcome1,
    Outcome2,
}

#[derive(Debug, Clone)]
struct ActionAmountPurchased {
    fusdc_amt: U256,
    outcome: Outcome,
}

fn strat_valid_u256() -> impl Strategy<Value = U256> {
    (1e6 as u128..REASONABLE_UPPER_AMT).prop_map(U256::from)
}

fn strat_action_amount_purchased() -> impl Strategy<Value = ActionAmountPurchased> {
    strat_valid_u256().prop_flat_map(move |fusdc_amt| {
        prop_oneof![Just(Outcome::Outcome1), Just(Outcome::Outcome2)]
            .prop_map(move |outcome| ActionAmountPurchased { fusdc_amt, outcome })
    })
}

fn strat_action_amount_purchasing(
    amt: usize,
) -> VecStrategy<impl Strategy<Value = ActionAmountPurchased>> {
    collection::vec(strat_action_amount_purchased(), 1..=amt)
}

proptest! {
    #[test]
    fn test_end_to_end_contract(
        outcome_1_id in [
            any::<u8>(), any::<u8>(), any::<u8>(), any::<u8>(),
            any::<u8>(), any::<u8>(), any::<u8>(), any::<u8>(),
        ],
        outcome_2_id in [
            any::<u8>(), any::<u8>(), any::<u8>(), any::<u8>(),
            any::<u8>(), any::<u8>(), any::<u8>(), any::<u8>(),
        ],
        outcome_winner in prop_oneof![Just(Outcome::Outcome1), Just(Outcome::Outcome2)],
        purchase_int_1 in strat_action_amount_purchasing(1000),
        purchase_int_2 in strat_action_amount_purchasing(1000),
    ) {
        prop_assume!(outcome_1_id != outcome_2_id);
        use lib9lives::storage_trading::StorageTrading;
        // This follows a classic interaction, with a user minting a random
        // amount of shares several thousand times on both sides, reporting when
        // things break down. This also prints the test data in a format that's
        // compatible with the Python code to find divergences.
        host::with_storage::<_, StorageTrading, _>(|c| {
            let outcome_1_id = FixedBytes::<8>::from(outcome_1_id);
            let outcome_2_id = FixedBytes::<8>::from(outcome_2_id);
            let outcomes = vec![
                (outcome_1_id, U256::from(1e6)),
                (outcome_2_id, U256::from(1e6))
            ];
            c.ctor(
                outcomes,
                msg::sender(),
                true,
                block::timestamp() + 1,
                block::timestamp() + 2,
                msg::sender()
            ).unwrap();
            let mut fusdc_vested = U256::ZERO;
            let mut share_1_received = U256::ZERO;
            let mut share_2_received = U256::ZERO;
            // Make the first group of random mints.
            for ActionAmountPurchased { fusdc_amt, outcome } in purchase_int_1 {
                fusdc_vested += fusdc_amt;
                let s = c.mint_227_C_F_432(
                    if outcome == Outcome::Outcome1 { outcome_1_id } else { outcome_2_id },
                    U256::from(fusdc_amt),
                    msg::sender()
                )
                    .unwrap();
                if outcome == Outcome::Outcome1 {
                    share_1_received += s;
                } else {
                    share_2_received += s;
                }
            }
            // Make the second group of random mints.
            for ActionAmountPurchased { fusdc_amt, outcome } in purchase_int_2 {
                fusdc_vested += fusdc_amt;
                let s = c.mint_227_C_F_432(
                    if outcome == Outcome::Outcome1 { outcome_1_id } else { outcome_2_id },
                    U256::from(fusdc_amt),
                    msg::sender()
                )
                    .unwrap();
                if outcome == Outcome::Outcome1 {
                    share_1_received += s;
                } else {
                    share_2_received += s;
                }
            }
            let (outcome_winner, winning_amt) = if outcome_winner == Outcome::Outcome1 {
                (outcome_1_id, share_1_received)
            } else {
                (outcome_2_id, share_2_received)
            };
            c.decide(outcome_winner).unwrap();
            let ret_amt = c.payoff(outcome_winner, winning_amt, msg::sender()).unwrap();
            assert!(
                ret_amt <= fusdc_vested,
                "ret_amt: {ret_amt} <= fusdc_vested: {fusdc_vested}, diff: {}",
                if ret_amt > fusdc_vested {
                    ret_amt - fusdc_vested
                } else {
                    fusdc_vested - ret_amt
                }
            );
        })
    }
}
