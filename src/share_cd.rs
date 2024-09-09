use stylus_sdk::alloy_primitives::{Address, FixedBytes, U256};

use crate::calldata::*;

//ctor(bytes8,address)
pub const CTOR_SELECTOR: [u8; 4] = [0x8e, 0x57, 0x64, 0xbd];

//mint(address,uint256)
pub const MINT_SELECTOR: [u8; 4] = [0x40, 0xc1, 0x0f, 0x19];

//burn(address,uint256)
pub const BURN_SELECTOR: [u8; 4] = [0x9d, 0xc2, 0x9f, 0xac];

pub fn pack_ctor(identifier: FixedBytes<8>, admin: Address) -> [u8; 4 + 32 * 2] {
    let mut b = [0_u8; 4 + 32 * 2];
    write_selector(&mut b, &CTOR_SELECTOR);
    write_b8(&mut b, 0, identifier);
    write_address(&mut b, 1, admin);
    b
}

pub fn pack_mint(spender: Address, amount: U256) -> [u8; 4 + 32 * 2] {
    let mut b = [0_u8; 4 + 32 * 2];
    write_selector(&mut b, &MINT_SELECTOR);
    write_address(&mut b, 0, spender);
    write_u256(&mut b, 1, amount);
    b
}

pub fn pack_burn(spender: Address, amount: U256) -> [u8; 4 + 32 * 2] {
    let mut b = [0_u8; 4 + 32 * 2];
    write_selector(&mut b, &BURN_SELECTOR);
    write_address(&mut b, 0, spender);
    write_u256(&mut b, 1, amount);
    b
}

#[test]
fn test_pack_ctor() {
    use stylus_sdk::alloy_primitives::address;

    //cast calldata 'ctor(bytes8,address)' 0x1234567812345678 0xfeb6034fc7df27df18a3a6bad5fb94c0d3dcb6d5
    assert_eq!(
        const_hex::const_encode::<68, true>(
        &pack_ctor(
            FixedBytes::from_slice(&[0x12, 0x34, 0x56, 0x78, 0x12, 0x34, 0x56, 0x78]),
            address!("feb6034fc7df27df18a3a6bad5fb94c0d3dcb6d5")
        )).to_string(),
        "0x8e5764bd1234567812345678000000000000000000000000000000000000000000000000000000000000000000000000feb6034fc7df27df18a3a6bad5fb94c0d3dcb6d5"
    );
}

#[test]
fn test_pack_mint() {
    use stylus_sdk::alloy_primitives::address;

    //cast calldata 'mint(address,uint256)' 0xfeb6034fc7df27df18a3a6bad5fb94c0d3dcb6d5 8181
    assert_eq!(
        const_hex::const_encode::<68, true>(
        &pack_mint(address!("feb6034fc7df27df18a3a6bad5fb94c0d3dcb6d5"), U256::from(8181))).to_string(),
        "0x40c10f19000000000000000000000000feb6034fc7df27df18a3a6bad5fb94c0d3dcb6d50000000000000000000000000000000000000000000000000000000000001ff5"
    );
}

#[test]
fn test_pack_burn() {
    use stylus_sdk::alloy_primitives::address;

    //cast calldata 'burn(address,uint256)' 0x6221a9c005f6e47eb398fd867784cacfdcfff4e7 99999919191919991919
    assert_eq!(
        const_hex::const_encode::<68, true>(
        &pack_burn(address!("6221a9c005f6e47eb398fd867784cacfdcfff4e7"),U256::from_limbs([7766198823372233839, 5, 0, 0]))).to_string(),
        "0x9dc29fac0000000000000000000000006221a9c005f6e47eb398fd867784cacfdcfff4e70000000000000000000000000000000000000000000000056bc714aeca289c6f"
    );
}
