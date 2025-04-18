use stylus_sdk::alloy_primitives::{Address, U256};

use alloc::string::String;

use crate::{
    erc20_call, error::Error, host_erc20_call::transfer_from, testing_addrs::ZERO_FOR_MINT_ADDR,
};

// Construct the ERC20 with the description in bytes provided, and an
// admin that can mint more tokens on request.
pub fn ctor(_addr: Address, _name: String, _admin: Address) -> Result<(), Error> {
    Ok(())
}

pub fn burn(addr: Address, spender: Address, amount: U256) -> Result<(), Error> {
    transfer_from(addr, spender, ZERO_FOR_MINT_ADDR, amount)
}

pub fn mint(addr: Address, spender: Address, amount: U256) -> Result<(), Error> {
    transfer_from(addr, ZERO_FOR_MINT_ADDR, spender, amount)
}

pub fn balance_of(addr: Address, spender: Address) -> Result<U256, Error> {
    erc20_call::balance_of(addr, spender)
}
