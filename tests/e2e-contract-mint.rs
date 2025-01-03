#![cfg(all(feature = "testing", not(target_arch = "wasm32")))]

use stylus_sdk::alloy_primitives::{fixed_bytes, Address, U256};

#[allow(unused)]
use lib9lives::{
    erc20_call,
    host::with_contract,
    immutables::{DAO_ADDR, FUSDC_ADDR},
    should_spend, strat_storage_trading,
    utils::{block_timestamp, msg_sender},
};

use proptest::proptest;

#[test]
#[cfg(feature = "trading-backend-dpm")]
fn test_e2e_mint_dpm() {
    use lib9lives::storage_trading::StorageTrading;
    with_contract::<_, StorageTrading, _>(|c| {
        let outcome_1 = fixed_bytes!("0541d76af67ad076");
        let outcome_2 = fixed_bytes!("3be0d8814450a582");
        c.ctor(
            vec![outcome_1, outcome_2],
            msg_sender(), // Whoever can call the oracle.
            block_timestamp() + 1,
            block_timestamp() + 2,
            DAO_ADDR,
            Address::ZERO, // The fee recipient.
            false,
        )
        .unwrap();
        // Check if the shares were correctly set.
        assert_eq!(c.outcome_shares.get(outcome_1), U256::from(1e6));
        assert_eq!(c.outcome_shares.get(outcome_2), U256::from(1e6));
        // To the contract after fee taking, this will be 5.7.
        let value = U256::from(1e6) * U256::from(6);
        // Take 7% from the amount (this is the fee).
        let fee = (value * U256::from(70)) / U256::from(1000);
        assert_eq!(
            should_spend!(FUSDC_ADDR, {msg_sender() => value},
                c.mint_test(outcome_1, value, msg_sender())
            ),
            U256::from(4181648)
        );
        c.decide(outcome_1).unwrap();
        assert_eq!(erc20_call::balance_of(FUSDC_ADDR, DAO_ADDR).unwrap(), fee);
    })
}

proptest! {
    #[test]
    #[cfg(feature = "trading-backend-amm")]
    fn test_e2e_outcome_prices_sum_to_1_amm(mut c in strat_storage_trading(false)) {
        // Generate several outcomes, then test that the price equals 1.
        c.created.set(true);
        for o in (0..c.outcome_list.len()).map(|i|c.outcome_list.get(i).unwrap()) {
            let r = c.price_A_827_E_D_27(o).unwrap();
            assert_eq!(U256::from(1), r, "outcome: {o}, amt: {r}");
        }
    }
}
