use stylus_sdk::{
    alloy_primitives::{Address, FixedBytes, U256},
    call::RawCall,
};

use crate::{erc20_call, error::Error, share_cd::*};

// Construct the ERC20 with the description in bytes provided, and an
// admin that can mint more tokens on request.
pub fn ctor(addr: Address, identifier: FixedBytes<8>, admin: Address) -> Result<(), Error> {
    RawCall::new()
        .call(addr, &pack_ctor(identifier, admin))
        .map_err(Error::ShareError)?;
    Ok(())
}

pub fn burn(addr: Address, spender: Address, amount: U256) -> Result<(), Error> {
    RawCall::new()
        .call(addr, &pack_burn(spender, amount))
        .map_err(Error::ShareError)?;
    Ok(())
}

pub fn mint(addr: Address, spender: Address, amount: U256) -> Result<(), Error> {
    RawCall::new()
        .call(addr, &pack_mint(spender, amount))
        .map_err(Error::ShareError)?;
    Ok(())
}

pub fn balance_of(addr: Address, spender: Address) -> Result<U256, Error> {
    erc20_call::balance_of(addr, spender)
}
