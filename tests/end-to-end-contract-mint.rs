use alloy_primitives::{fixed_bytes, Address, U256};
use lib9lives::host;
use stylus_sdk::msg;

#[test]
fn test_mint() {
    use lib9lives::trading_storage::StorageTrading;
    host::with_storage::<_, StorageTrading, _>(|c| {
        c.ctor(
            Address::from([1_u8; 20]),
            vec![
                (fixed_bytes!("0541d76af67ad076"), U256::from(1e6)),
                (fixed_bytes!("3be0d8814450a582"), U256::from(1e6)),
            ],
        )
        .unwrap();

        dbg!(c
            .mint_E_12943_C_E(
                fixed_bytes!("0541d76af67ad076"),
                U256::from(1e6),
                msg::sender(),
            )
            .unwrap());
    })
}
