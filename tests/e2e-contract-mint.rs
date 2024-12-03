use stylus_sdk::{
    alloy_primitives::{fixed_bytes, U256, Address},
};

use lib9lives::{utils::{block_timestamp, msg_sender}, host};

#[test]
#[cfg(feature = "trading-backend-dpm")]
fn test_e2e_mint() {
    use lib9lives::storage_trading::StorageTrading;
    host::with_storage::<_, StorageTrading, _>(|c| {
        let outcome_1 = fixed_bytes!("0541d76af67ad076");
        c.ctor(
            vec![outcome_1, fixed_bytes!("3be0d8814450a582")],
            msg_sender(),
            block_timestamp() + 1,
            block_timestamp() + 2,
            msg_sender(),
            Address::ZERO
        )
        .unwrap();

        // To the contract after fee taking, this will be 5.7.
        let value = U256::from(1e6) * U256::from(6);
        assert_eq!(
            c.mint_0_D_365_E_C_6(outcome_1, value, msg_sender(),)
                .unwrap(),
            U256::from(725165) // This is 0.7251655651839098
        );

        c.decide(outcome_1).unwrap();
    })
}
