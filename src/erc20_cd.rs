use stylus_sdk::alloy_primitives::{Address, FixedBytes, U256};

use crate::calldata::*;

//transfer(address,uint256)
const TRANSFER_SELECTOR: [u8; 4] = [0xa9, 0x05, 0x9c, 0xbb];

//transferFrom(address,address,uint256)
const TRANSFER_FROM_SELECTOR: [u8; 4] = [0x23, 0xb8, 0x72, 0xdd];

//permit(address,address,uint256,uint256,uint8,bytes32,bytes32)
const PERMIT_SELECTOR: [u8; 4] = [0xd5, 0x05, 0xac, 0xcf];

//balanceOf(address)
const BALANCE_OF_SELECTOR: [u8; 4] = [0x70, 0xa0, 0x82, 0x31];

pub fn pack_transfer(recipient: Address, value: U256) -> [u8; 4 + 32 * 2] {
    let mut cd = [0_u8; 4 + 32 * 2];
    write_selector(&mut cd, &TRANSFER_SELECTOR);
    write_address(&mut cd, 0, recipient);
    write_u256(&mut cd, 1, value);
    cd
}

pub fn pack_transfer_from(sender: Address, recipient: Address, amount: U256) -> [u8; 4 + 32 * 3] {
    let mut cd = [0_u8; 4 + 32 * 3];
    write_selector(&mut cd, &TRANSFER_FROM_SELECTOR);
    write_address(&mut cd, 0, sender);
    write_address(&mut cd, 1, recipient);
    write_u256(&mut cd, 2, amount);
    cd
}

pub fn pack_permit(
    owner: Address,
    spender: Address,
    value: U256,
    deadline: U256,
    v: u8,
    r: FixedBytes<32>,
    s: FixedBytes<32>,
) -> [u8; 4 + 32 * 7] {
    let mut cd = [0_u8; 4 + 32 * 7];
    write_selector(&mut cd, &PERMIT_SELECTOR);
    write_address(&mut cd, 0, owner);
    write_address(&mut cd, 1, spender);
    write_u256(&mut cd, 2, value);
    write_u256(&mut cd, 3, deadline);
    write_u8(&mut cd, 4, v);
    write_b32(&mut cd, 5, r);
    write_b32(&mut cd, 6, s);
    cd
}

pub fn pack_balance_of(spender: Address) -> [u8; 4 + 32] {
    let mut cd = [0_u8; 4 + 32];
    write_selector(&mut cd, &BALANCE_OF_SELECTOR);
    write_address(&mut cd, 0, spender);
    cd
}

#[test]
fn test_transfer() {
    use stylus_sdk::alloy_primitives::address;

    use const_hex;

    let b = const_hex::encode(&pack_transfer(
        address!("6221a9c005f6e47eb398fd867784cacfdcfff4e7"),
        U256::from(123),
    ));

    assert_eq!(
        b,
        //cast calldata 'transfer(address,uint256)' `{bayge} 123
       "a9059cbb0000000000000000000000006221a9c005f6e47eb398fd867784cacfdcfff4e7000000000000000000000000000000000000000000000000000000000000007b"
    );
}

#[test]
fn test_pack_transfer_from() {
    use stylus_sdk::alloy_primitives::address;

    assert_eq!(
        &pack_transfer_from(
            address!("6221a9c005f6e47eb398fd867784cacfdcfff4e7"),
            address!("feb6034fc7df27df18a3a6bad5fb94c0d3dcb6d5"),
            U256::from(100)
        ),
        &[
            //cast calldata 'transferFrom(address,address,uint256)' 0x6221a9c005f6e47eb398fd867784cacfdcfff4e7 0xfeb6034fc7df27df18a3a6bad5fb94c0d3dcb6d5 100
            0x23, 0xb8, 0x72, 0xdd, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
            0x00, 0x00, 0x62, 0x21, 0xa9, 0xc0, 0x05, 0xf6, 0xe4, 0x7e, 0xb3, 0x98, 0xfd, 0x86,
            0x77, 0x84, 0xca, 0xcf, 0xdc, 0xff, 0xf4, 0xe7, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
            0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xfe, 0xb6, 0x03, 0x4f, 0xc7, 0xdf, 0x27, 0xdf,
            0x18, 0xa3, 0xa6, 0xba, 0xd5, 0xfb, 0x94, 0xc0, 0xd3, 0xdc, 0xb6, 0xd5, 0x00, 0x00,
            0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
            0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
            0x00, 0x64,
        ]
    );
}

#[test]
fn test_pack_permit() {
    use stylus_sdk::alloy_primitives::address;

    use const_hex;

    //cast calldata 'permit(address,address,uint256,uint256,uint8,bytes32,bytes32)' 0x6221a9c005f6e47eb398fd867784cacfdcfff4e7 0xfeb6034fc7df27df18a3a6bad5fb94c0d3dcb6d5 123 456 9 1c8aff950685c2ed4bc3174f3472287b56d9517b9c948127319a09a7a36deac8 8452c9b9140222b08593a26daa782707297be9f7b3e8281d7b4974769f19afd0
    let b = const_hex::encode(&pack_permit(
        address!("6221a9c005f6e47eb398fd867784cacfdcfff4e7"),
        address!("feb6034fc7df27df18a3a6bad5fb94c0d3dcb6d5"),
        U256::from(123),
        U256::from(456),
        9,
        FixedBytes::from_slice(&[
            0x1c, 0x8a, 0xff, 0x95, 0x06, 0x85, 0xc2, 0xed, 0x4b, 0xc3, 0x17, 0x4f, 0x34, 0x72,
            0x28, 0x7b, 0x56, 0xd9, 0x51, 0x7b, 0x9c, 0x94, 0x81, 0x27, 0x31, 0x9a, 0x09, 0xa7,
            0xa3, 0x6d, 0xea, 0xc8,
        ]),
        FixedBytes::from_slice(&[
            0x84, 0x52, 0xc9, 0xb9, 0x14, 0x02, 0x22, 0xb0, 0x85, 0x93, 0xa2, 0x6d, 0xaa, 0x78,
            0x27, 0x07, 0x29, 0x7b, 0xe9, 0xf7, 0xb3, 0xe8, 0x28, 0x1d, 0x7b, 0x49, 0x74, 0x76,
            0x9f, 0x19, 0xaf, 0xd0,
        ]),
    ));
    assert_eq!(
        b,
        "d505accf0000000000000000000000006221a9c005f6e47eb398fd867784cacfdcfff4e7000000000000000000000000feb6034fc7df27df18a3a6bad5fb94c0d3dcb6d5000000000000000000000000000000000000000000000000000000000000007b00000000000000000000000000000000000000000000000000000000000001c800000000000000000000000000000000000000000000000000000000000000091c8aff950685c2ed4bc3174f3472287b56d9517b9c948127319a09a7a36deac88452c9b9140222b08593a26daa782707297be9f7b3e8281d7b4974769f19afd0"
    );
}