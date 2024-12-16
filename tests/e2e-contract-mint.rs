use stylus_sdk::alloy_primitives::{fixed_bytes, Address, U256};

use lib9lives::{
    host,
    utils::{block_timestamp, msg_sender},
};

#[test]
#[cfg(feature = "trading-backend-dpm")]
fn test_e2e_mint() {
    use lib9lives::storage_trading::StorageTrading;
    host::with_contract::<_, StorageTrading, _>(|c| {
        let outcome_1 = fixed_bytes!("0541d76af67ad076");
        let outcome_2 = fixed_bytes!("3be0d8814450a582");
        c.ctor(
            vec![outcome_1, outcome_2],
            msg_sender(),
            block_timestamp() + 1,
            block_timestamp() + 2,
            msg_sender(),
            Address::ZERO,
            false,
        )
        .unwrap();

        // Check if the shares were correctly set.
        assert_eq!(c.outcome_shares.get(outcome_1), U256::from(1e6));
        assert_eq!(c.outcome_shares.get(outcome_2), U256::from(1e6));

        // To the contract after fee taking, this will be 5.7.
        let value = U256::from(1e6) * U256::from(6);
        assert_eq!(
            c.mint_test(outcome_1, value, msg_sender()).unwrap(),
            U256::from(821821)
        );

        c.decide(outcome_1).unwrap();
    })
}
