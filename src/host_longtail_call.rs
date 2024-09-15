use stylus_sdk::alloy_primitives::{Address, U256};

use crate::error::Error;

pub fn create_pool(
    _erc20: Address,
    _price: U256,
    _fee: u32,
    _spacing: u8,
    _liq_per_tick: u128,
) -> Result<(), Error> {
    Ok(())
}

pub fn pause_pool(_erc20: Address) -> Result<(), Error> {
    Ok(())
}
