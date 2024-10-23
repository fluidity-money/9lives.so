use stylus_sdk::{msg, alloy_primitives::{fixed_bytes, Address, U256}};
use lib9lives::host;

#[test]
fn test_e2e_mint() {
    use lib9lives::trading_storage::StorageTrading;
    host::with_storage::<_, StorageTrading, _>(|c| {
        let outcome_1 = fixed_bytes!("0541d76af67ad076");
        c.ctor(
            msg::sender(),
            vec![
                (outcome_1, U256::from(1e6)),
                (fixed_bytes!("3be0d8814450a582"), U256::from(1e6)),
            ],
        )
        .unwrap();

        assert_eq!(
            c.mint_227_C_F_432(
                outcome_1,
                U256::from(1e6) * U256::from(6),
                msg::sender(),
            )
            .unwrap(),
            U256::from(4476926)
        );

        c.decide(outcome_1).unwrap();
    })
}
