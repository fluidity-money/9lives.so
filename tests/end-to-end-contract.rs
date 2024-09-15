#![cfg(feature = "testing")]

use stylus_sdk::alloy_primitives::{Address, U256, FixedBytes};

use lib9lives::host;

#[test]
fn test_factory_new_trading() {
    use lib9lives::factory_contract::Factory;
    host::with_storage::<_, Factory, _>(|c| {
        c.ctor(Address::ZERO).unwrap();
        let id = FixedBytes::<8>::from_slice(&[0x1e, 0x9e, 0x51, 0x83, 0x7f, 0x3e, 0xa6, 0xea]);
        let id2 = FixedBytes::<8>::from_slice(&[0x1f, 0x9e, 0x51, 0x83, 0x7f, 0x3e, 0xa6, 0xea]);
        c.new_trading(vec![(id, U256::from(1)), (id2, U256::from(2))]).unwrap();
    })
}
