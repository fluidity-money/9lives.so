use stylus_sdk::alloy_primitives::{Address, FixedBytes, U256};

use crate::error::Error;

#[cfg(test)]
use const_hex;

pub fn write_address(bytes: &mut [u8], slot: usize, address: Address) {
    let o = 4 + 32 * slot;
    bytes[o + 12..o + 32].copy_from_slice(&address.0 .0)
}
pub fn write_u256(bytes: &mut [u8], slot: usize, uint: U256) {
    let o = 4 + 32 * slot;
    bytes[o..o + 32].copy_from_slice(&uint.to_be_bytes::<32>())
}
pub fn write_b8(bytes: &mut [u8], slot: usize, x: FixedBytes<8>) {
    let o = 4 + 32 * slot;
    bytes[o..o + 8].copy_from_slice(x.as_slice())
}
pub fn write_b32(bytes: &mut [u8], slot: usize, x: FixedBytes<32>) {
    let o = 4 + 32 * slot;
    bytes[o..o + 32].copy_from_slice(x.as_slice())
}
pub fn write_u8(bytes: &mut [u8], slot: usize, b: u8) {
    let o = 4 + 32 * slot;
    bytes[o + 31] = b
}
pub fn write_u32(bytes: &mut [u8], slot: usize, uint: u32) {
    let o = 4 + 32 * slot;
    bytes[o + 28..o + 32].copy_from_slice(&uint.to_be_bytes())
}
pub fn write_u128(bytes: &mut [u8], slot: usize, uint: u128) {
    let o = 4 + 32 * slot;
    bytes[o + 16..o + 32].copy_from_slice(&uint.to_be_bytes())
}
pub fn write_bool(bytes: &mut [u8], slot: usize, b: bool) {
    write_u8(bytes, slot, b as u8)
}
pub fn write_selector(bytes: &mut [u8], selector: &[u8; 4]) {
    bytes[0..4].copy_from_slice(&selector[..])
}

pub fn unpack_u256(data: &[u8]) -> Option<U256> {
    U256::try_from_be_slice(data)
}

pub fn unpack_bool_safe(data: &[u8]) -> Result<(), Error> {
    match data.get(31) {
        None | Some(1) => Ok(()),
        _ => Err(Error::ERC20ReturnedFalse),
    }
}

#[test]
fn test_write_address() {
    use stylus_sdk::alloy_primitives::address;
    let mut b = [0_u8; 4 + 32];
    write_address(
        &mut b,
        0,
        address!("6221a9c005f6e47eb398fd867784cacfdcfff4e7"),
    );
    assert_eq!(
        const_hex::encode(&b),
        "000000000000000000000000000000006221a9c005f6e47eb398fd867784cacfdcfff4e7"
    )
}

#[test]
fn test_write_u256() {
    let mut b = [0_u8; 4 + 32];
    write_selector(&mut b, &[0xb0, 0xf0, 0xc9, 0x6a]);
    //cast calldata 'hello(uint256)' 1
    write_u256(&mut b, 0, U256::from(1));
    assert_eq!(
        const_hex::encode(&b),
        "b0f0c96a0000000000000000000000000000000000000000000000000000000000000001"
    );
    //cast calldata 'hello(uint256)' 115792089237316195423570985008687907853269984665640564039457584007913129639935
    write_u256(
        &mut b,
        0,
        U256::from_limbs([
            18446744073709551615,
            18446744073709551615,
            18446744073709551615,
            18446744073709551615,
        ]),
    );
    assert_eq!(
        const_hex::encode(&b),
        "b0f0c96affffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"
    )
}

#[test]
fn test_write_b8() {
    //cast calldata 'hello(bytes8)' 0x4545030055055699
    let mut b = [0_u8; 4 + 32];
    write_selector(&mut b, &[0x9b, 0xb0, 0x1b, 0xc6]);
    write_b8(
        &mut b,
        0,
        FixedBytes::from_slice(&[0x45, 0x45, 0x03, 0x00, 0x55, 0x05, 0x56, 0x99]),
    );
    assert_eq!(
        const_hex::encode(&b),
        "9bb01bc64545030055055699000000000000000000000000000000000000000000000000"
    );
}

#[test]
fn test_write_b32() {
    //cast calldata 'hello(bytes32)' 8519dd1b0fae269362142025eb1ce3195274c63b454fec15634db968426fccfe
    let mut b = [0_u8; 4 + 32];
    write_selector(&mut b, &[0xb3, 0x91, 0xe5, 0x05]);
    write_b32(
        &mut b,
        0,
        FixedBytes::from_slice(&[
            0x85, 0x19, 0xdd, 0x1b, 0x0f, 0xae, 0x26, 0x93, 0x62, 0x14, 0x20, 0x25, 0xeb, 0x1c,
            0xe3, 0x19, 0x52, 0x74, 0xc6, 0x3b, 0x45, 0x4f, 0xec, 0x15, 0x63, 0x4d, 0xb9, 0x68,
            0x42, 0x6f, 0xcc, 0xfe,
        ]),
    );
    assert_eq!(
        const_hex::encode(&b),
        "b391e5058519dd1b0fae269362142025eb1ce3195274c63b454fec15634db968426fccfe"
    );
}

#[test]
fn test_write_u8() {
    //cast calldata 'hello(uint8)' 8
    let mut b = [0_u8; 4 + 32];
    write_selector(&mut b, &[0xd6, 0x50, 0x06, 0xcf]);
    write_u8(&mut b, 0, 8);
    assert_eq!(
        const_hex::encode(&b),
        "d65006cf0000000000000000000000000000000000000000000000000000000000000008"
    );
}

#[test]
fn test_write_u128() {
    //cast calldata 'hello(uint128)' 88478
    let mut b = [0_u8; 4 + 32];
    write_selector(&mut b, &[0x6d, 0x67, 0x7a, 0x1f]);
    write_u128(&mut b, 0, 88478);
    assert_eq!(
        const_hex::encode(&b),
        "6d677a1f000000000000000000000000000000000000000000000000000000000001599e"
    );
}
