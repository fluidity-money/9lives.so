use stylus_sdk::alloy_primitives::{Address, FixedBytes};

use alloc::vec::Vec;

use crate::error::Error;

pub fn ctor(
    _contract: Address,
    _outcomes: Vec<FixedBytes<8>>,
    _oracle: Address,
    _time_start: u64,
    _time_ending: u64,
    _fee_recipient: Address,
    _share_impl: Address
) -> Result<(), Error> {
    Ok(())
}

pub fn decide(_contract: Address, _winner: FixedBytes<8>) -> Result<(), Error> {
    Ok(())
}
