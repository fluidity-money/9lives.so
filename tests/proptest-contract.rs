#![cfg(all(
    feature = "trading-backend-dpm",
    feature = "testing",
    not(target_arch = "wasm32")
))]

use stylus_sdk::alloy_primitives::{Address, FixedBytes, U256};

use proptest::{
    collection::{self, VecStrategy},
    prelude::*,
    strategy::Strategy,
};

use lib9lives::{
    host,
    utils::{block_timestamp, msg_sender},
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
    #[ignore]
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
        fee_creator in 0u64..100,
        fee_minter in 0u64..100,
        fee_lp in 0u64..100
    ) {
        prop_assume!(outcome_1_id != outcome_2_id);
        use lib9lives::storage_trading::StorageTrading;
        // This follows a classic interaction, with a user minting a random
        // amount of shares several thousand times on both sides, reporting when
        // things break down. This also prints the test data in a format that's
        // compatible with the Python code to find divergences.
        host::with_contract::<_, StorageTrading, _>(|c| {
            let outcome_1_id = FixedBytes::<8>::from(outcome_1_id);
            let outcome_2_id = FixedBytes::<8>::from(outcome_2_id);
            let outcomes = vec![
                outcome_1_id,
                outcome_2_id,
            ];
            c.ctor(
                outcomes,
                msg_sender(),
                block_timestamp() + 1,
                block_timestamp() + 2,
                msg_sender(),
                Address::ZERO,
                false,
                fee_creator,
                fee_minter,
                fee_lp,
            ).unwrap();
            let mut fusdc_vested = U256::ZERO;
            let mut share_1_received = U256::ZERO;
            let mut share_2_received = U256::ZERO;
            // Make the first group of random mints.
            for ActionAmountPurchased { fusdc_amt, outcome } in purchase_int_1 {
                let s = c.mint_test(
                    if outcome == Outcome::Outcome1 { outcome_1_id } else { outcome_2_id },
                    U256::from(fusdc_amt),
                    msg_sender()
                )
                    .expect(&format!("mint: fusdc vested: {fusdc_vested}, share 1 received so far: {share_1_received}, share 2 received so far: {share_2_received}"));
                if outcome == Outcome::Outcome1 {
                    share_1_received += s;
                } else {
                    share_2_received += s;
                }
                fusdc_vested += fusdc_amt;
            }
            // Make the second group of random mints.
            for ActionAmountPurchased { fusdc_amt, outcome } in purchase_int_2 {
                fusdc_vested += fusdc_amt;
                let s = c.mint_test(
                    if outcome == Outcome::Outcome1 { outcome_1_id } else { outcome_2_id },
                    U256::from(fusdc_amt),
                    msg_sender()
                )
                    .expect(&format!("fusdc vested: {fusdc_vested}, fusdc amt: {fusdc_amt}, outcome: {outcome:?}, share 1 received: {share_1_received}, share 2 received: {share_2_received}"));
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
            let ret_amt = c.payoff_91_F_A_8_C_2_E(outcome_winner, winning_amt, msg_sender()).unwrap();
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
