use stylus_sdk::alloy_primitives::{Address, U256};

use alloc::string::String;

use crate::{erc20_call, error::Error};

// Construct the ERC20 with the description in bytes provided, and an
// admin that can mint more tokens on request.
pub fn ctor(_addr: Address, _name: String, _admin: Address) -> Result<(), Error> {
    Ok(())
}

pub fn burn(_addr: Address, _spender: Address, _amount: U256) -> Result<(), Error> {
    Ok(())
}

pub fn mint(_addr: Address, _spender: Address, _amount: U256) -> Result<(), Error> {
    Ok(())
}

pub fn balance_of(addr: Address, spender: Address) -> Result<U256, Error> {
    erc20_call::balance_of(addr, spender)
}
