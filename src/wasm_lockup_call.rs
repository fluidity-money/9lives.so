use stylus_sdk::{
    alloy_primitives::{Address, U256},
    call::RawCall,
};

use alloy_sol_macro::sol;

use alloy_sol_types::SolCall;

use crate::{calldata::unpack_u256, error::Error};

sol! {
    function freeze(address spender, uint256 until);
    function stakedArbBal(address holder);
    function confiscate(address victim, address recipient);
}

pub fn freeze(addr: Address, spender: Address, until: U256) -> Result<(), Error> {
    RawCall::new()
        .call(addr, &freezeCall { spender, until }.abi_encode())
        .map_err(|b| Error::LockupError(addr, b))?;
    Ok(())
}

pub fn staked_arb_bal(addr: Address, holder: Address) -> Result<U256, Error> {
    unpack_u256(
        &RawCall::new()
            .call(addr, &stakedArbBalCall { holder }.abi_encode())
            .map_err(|b| Error::LockupError(addr, b))?,
    )
    .ok_or(Error::LockupUnableToUnpack)
}

pub fn confiscate(addr: Address, victim: Address, recipient: Address) -> Result<U256, Error> {
    unpack_u256(
        &RawCall::new()
            .call(addr, &confiscateCall { victim, recipient }.abi_encode())
            .map_err(|b| Error::LockupError(addr, b))?,
    )
    .ok_or(Error::LockupUnableToUnpack)
}
