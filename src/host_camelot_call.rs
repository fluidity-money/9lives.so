use stylus_sdk::alloy_primitives::{U256, Address};

use crate::error::Error;

pub fn create_pool(
    erc20: Address,
    _price: U256,
    _fee: u32,
    _spacing: u8,
    _liq_per_tick: u128,
) -> Result<Address, Error> {
    Ok(erc20)
}

pub fn enable_pool(_erc20: Address) -> Result<(), Error> {
    Ok(())
}

pub fn pause_pool(_erc20: Address) -> Result<(), Error> {
    Ok(())
}