use stylus_sdk::alloy_primitives::{Address, FixedBytes, U256};

use crate::error::Error;

pub fn ctor(
    _contract: Address,
    _outcomes: Vec<(FixedBytes<8>, U256)>,
    _oracle: Address,
    _is_dpm: bool,
    _time_start: u64,
    _time_ending: u64,
    _fee_recipient: Address,
) -> Result<(), Error> {
    Ok(())
}

pub fn decide(_contract: Address, _winner: FixedBytes<8>) -> Result<(), Error> {
    Ok(())
}
