use stylus_sdk::{
    alloy_primitives::{Address, U256},
    alloy_sol_types::{sol, SolCall},
    call::RawCall,
};

use alloc::string::String;

use crate::{erc20_call, error::Error};

sol! {
    function ctor(string name, address admin);
    function mint(address spender, uint256 amount);
    function burn(address spender, uint256 amount);
}

// Construct the ERC20 with the description in bytes provided, and an
// admin that can mint more tokens on request.
pub fn ctor(addr: Address, name: String, admin: Address) -> Result<(), Error> {
    RawCall::new()
        .call(addr, &ctorCall { name, admin }.abi_encode())
        .map_err(Error::ShareError)?;
    Ok(())
}

pub fn mint(addr: Address, spender: Address, amount: U256) -> Result<(), Error> {
    RawCall::new()
        .call(addr, &mintCall { spender, amount }.abi_encode())
        .map_err(Error::ShareError)?;
    Ok(())
}

pub fn burn(addr: Address, spender: Address, amount: U256) -> Result<(), Error> {
    RawCall::new()
        .call(addr, &burnCall { spender, amount }.abi_encode())
        .map_err(Error::ShareError)?;
    Ok(())
}

pub fn balance_of(addr: Address, spender: Address) -> Result<U256, Error> {
    erc20_call::balance_of(addr, spender)
}
