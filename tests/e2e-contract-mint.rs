
use stylus_sdk::{
    alloy_primitives::{fixed_bytes, U256},
    msg,
    block
};

use lib9lives::host;

#[test]
fn test_e2e_mint() {
    use lib9lives::storage_trading::StorageTrading;
    host::with_storage::<_, StorageTrading, _>(|c| {
        let outcome_1 = fixed_bytes!("0541d76af67ad076");
        c.ctor(
            vec![
                (outcome_1, U256::from(1e6)),
                (fixed_bytes!("3be0d8814450a582"), U256::from(1e6)),
            ],
            msg::sender(),
            block::timestamp() + 1,
            block::timestamp() + 2,
            msg::sender()
        )
        .unwrap();

        // To the contract after fee taking, this will be 5.7.
        let value = U256::from(1e6) * U256::from(6);
        assert_eq!(
            c.mint_227_C_F_432(outcome_1, value, msg::sender(),)
                .unwrap(),
            U256::from(2447835) // This is 2.447835540106563e-06
        );

        c.decide(outcome_1).unwrap();
    })
}
