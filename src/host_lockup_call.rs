use stylus_sdk::alloy_primitives::{Address, U256};

use crate::error::Error;

pub fn freeze(_addr: Address, _spender: Address, _until: U256) -> Result<(), Error> {
    Ok(())
}

pub fn staked_arb_bal(_addr: Address, _holder: Address) -> Result<U256, Error> {
    Ok(U256::from(1))
}

pub fn confiscate(_addr: Address, _victim: Address, _recipient: Address) -> Result<U256, Error> {
    Ok(U256::from(1))
}
