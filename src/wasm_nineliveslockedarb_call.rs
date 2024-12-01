use crate::{calldata::unpack_u256, error::Error};

use stylus_sdk::{
    alloy_primitives::{Address, U256},
    call::RawCall,
};

use stylus_sdk::alloy_sol_types::sol;

use alloy_sol_types::SolCall;

sol! {
    function ctor(address owner) external;
    function getPastVotes(address spender, uint256 timepoint) external view returns (uint256);
}

/// Construct the Locked ARB token that we're going to supply control.
pub fn ctor(addr: Address, owner: Address) -> Result<(), Error> {
    RawCall::new()
        .call(addr, &ctorCall { owner }.abi_encode())
        .map_err(|b| Error::LockedARBError(addr, b))?;
    Ok(())
}

/// Get the past votes for a address at a point in time.
pub fn get_past_votes(addr: Address, spender: Address, timepoint: U256) -> Result<U256, Error> {
    unpack_u256(
        &RawCall::new()
            .call(addr, &getPastVotesCall { spender, timepoint }.abi_encode())
            .map_err(|b| Error::LockedARBError(addr, b))?,
    )
    .ok_or(Error::LockedARBUnableToUnpack)
}
