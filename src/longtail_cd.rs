use stylus_sdk::alloy_primitives::{Address, U256};

use crate::calldata::*;

//createPool653F395E(address,uint256,uint32)
const CREATE_POOL_SELECTOR: [u8; 4] = [0x00, 0x00, 0x03, 0xa3];

//enablePool579DA658(address,bool)
const PAUSE_POOL_SELECTOR: [u8; 4] = [0x00, 0x00, 0x03, 0xf4];

pub fn pack_create_pool(erc20: Address, price: U256, fee: u32) -> [u8; 4 + 32 * 3] {
    let mut b = [0_u8; 4 + 32 * 3];
    write_selector(&mut b, &CREATE_POOL_SELECTOR);
    write_address(&mut b, 0, erc20);
    write_u256(&mut b, 1, price);
    write_u32(&mut b, 2, fee);
    b
}

pub fn pack_enable_pool(erc20: Address, enabled: bool) -> [u8; 4 + 32 * 2] {
    let mut b = [0_u8; 4 + 32 * 2];
    write_selector(&mut b, &PAUSE_POOL_SELECTOR);
    write_address(&mut b, 0, erc20);
    write_bool(&mut b, 1, enabled);
    b
}

#[test]
fn test_pack_create_pool() {
    use stylus_sdk::alloy_primitives::address;

    use const_hex;

    //cast calldata 'createPool653F395E(address,uint256,uint32)' 0x6221a9c005f6e47eb398fd867784cacfdcfff4e7 500 20
    let b = const_hex::encode(&pack_create_pool(
        address!("6221a9c005f6e47eb398fd867784cacfdcfff4e7"),
        U256::from(500),
        20,
    ));
    assert_eq!(b, "000003a30000000000000000000000006221a9c005f6e47eb398fd867784cacfdcfff4e700000000000000000000000000000000000000000000000000000000000001f40000000000000000000000000000000000000000000000000000000000000014")
}

#[test]
fn test_pack_enable_pool() {
    use stylus_sdk::alloy_primitives::address;

    use const_hex;

    //cast calldata 'enablePool579DA658(address,bool)' 0x6221a9c005f6e47eb398fd867784cacfdcfff4e7 false
    let b = const_hex::encode(&pack_enable_pool(
        address!("6221a9c005f6e47eb398fd867784cacfdcfff4e7"),
        false,
    ));
    assert_eq!(b, "000003f40000000000000000000000006221a9c005f6e47eb398fd867784cacfdcfff4e70000000000000000000000000000000000000000000000000000000000000000")
}
