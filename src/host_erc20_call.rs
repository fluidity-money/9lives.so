use stylus_sdk::alloy_primitives::{Address, FixedBytes, U256};

use crate::error::Error;

pub fn transfer(_addr: Address, _recipient: Address, _value: U256) -> Result<(), Error> {
    Ok(())
}

pub fn transfer_from(
    _addr: Address,
    _spender: Address,
    _recipient: Address,
    _amount: U256,
) -> Result<(), Error> {
    Ok(())
}

pub fn permit(
    _addr: Address,
    _owner: Address,
    _spender: Address,
    _value: U256,
    _deadline: U256,
    _v: u8,
    _r: FixedBytes<32>,
    _s: FixedBytes<32>,
) -> Result<(), Error> {
    Ok(())
}

pub fn balance_of(_addr: Address, _spender: Address) -> Result<U256, Error> {
    Ok(U256::from(100))
}
