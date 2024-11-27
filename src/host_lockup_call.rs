use stylus_sdk::alloy_primitives::{Address, U256};

use crate::error::Error;

pub fn freeze(_addr: Address, _spender: Address, _until: U256) -> Result<(), Error> {
    Ok(())
}
