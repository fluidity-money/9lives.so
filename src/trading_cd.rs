use stylus_sdk::alloy_primitives::{Address, FixedBytes, U256};

use crate::error::Error;

pub fn ctor(
    _contract: Address,
    _funder: Address,
    _oracle: Address,
    _outcomes: &Vec<(FixedBytes<8>, U256)>,
) -> Result<(), Error> {
    Ok(())
}
