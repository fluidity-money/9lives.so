use stylus_sdk::alloy_primitives::{Address, U256, FixedBytes};

use crate::calldata::*;

//transferFrom(address,address,uint256)
const TRANSFER_FROM_SELECTOR: [u8; 4] = [0x23, 0xb8, 0x72, 0xdd];

//permit(address,address,uint256,uint256,uint8,bytes32,bytes32)
const PERMIT_SELECTOR: [u8; 4] = [0xd5, 0x05, 0xac, 0xcf];

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
