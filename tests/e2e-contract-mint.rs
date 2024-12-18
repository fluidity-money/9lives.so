#![cfg(not(target_arch = "wasm32"))]

use stylus_sdk::alloy_primitives::{fixed_bytes, Address, U256};

use lib9lives::{
    erc20_call,
    host::with_contract,
    immutables::{FUSDC_ADDR, TESTING_DAO_ADDR},
    should_spend,
    utils::{block_timestamp, msg_sender},
};

#[test]
#[cfg(feature = "trading-backend-dpm")]
fn test_e2e_mint() {
    use lib9lives::storage_trading::StorageTrading;
    with_contract::<_, StorageTrading, _>(|c| {
        let outcome_1 = fixed_bytes!("0541d76af67ad076");
        let outcome_2 = fixed_bytes!("3be0d8814450a582");
        c.ctor(
            vec![outcome_1, outcome_2],
            msg_sender(), // Whoever can call the oracle.
            block_timestamp() + 1,
            block_timestamp() + 2,
            TESTING_DAO_ADDR,
            Address::ZERO, // The fee recipient.
            false,
        )
        .unwrap();
        // Check if the shares were correctly set.
        assert_eq!(c.outcome_shares.get(outcome_1), U256::from(1e6));
        assert_eq!(c.outcome_shares.get(outcome_2), U256::from(1e6));
        // To the contract after fee taking, this will be 5.7.
        let value = U256::from(1e6) * U256::from(6);
        let fee = U256::from(300000);
        assert_eq!(
            should_spend!(FUSDC_ADDR, {msg_sender() => value},
                c.mint_test(outcome_1, value, msg_sender())
            ),
            U256::from(4181648)
        );
        c.decide(outcome_1).unwrap();
        assert_eq!(
            erc20_call::balance_of(FUSDC_ADDR, TESTING_DAO_ADDR).unwrap(),
            fee
        );
    })
}
