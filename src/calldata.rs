use stylus_sdk::alloy_primitives::{Address, FixedBytes, U256};

use crate::error::Error;

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
pub fn write_u8(bytes: &mut [u8], slot: usize, uint: u8) {
    let o = 4 + 32 * slot;
    bytes[o..o + 32].copy_from_slice(&uint.to_be_bytes())
}
pub fn write_selector(bytes: &mut [u8], selector: &[u8; 4]) {
    bytes[0..4].copy_from_slice(&selector[..])
}

pub fn unpack_u256(data: &[u8]) -> Option<U256> {
    U256::try_from_be_slice(&data)
}

pub fn unpack_bool_safe(data: &[u8]) -> Result<(), Error> {
    match data.get(31) {
        None | Some(1) => Ok(()),
        Some(0) | _ => Err(Error::ERC20ReturnedFalse.into()),
    }
}
