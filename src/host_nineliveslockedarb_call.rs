#![coverage(off)]

use crate::error::Error;

use stylus_sdk::alloy_primitives::{Address, U256};

pub fn ctor(_token: Address, _owner: Address) -> Result<(), Error> {
    Ok(())
}

/// Get the past votes for a address at a point in time.
pub fn get_past_votes(_addr: Address, _spender: Address, _timepoint: U256) -> Result<U256, Error> {
    // TODO: send based on a function we track.
    Ok(U256::ZERO)
}
