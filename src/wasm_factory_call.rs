use stylus_sdk::{
    alloy_primitives::{Address, FixedBytes},
    call::RawCall,
};

use stylus_sdk::alloy_sol_types::sol;

use alloy_sol_types::SolCall;

use crate::{calldata::unpack_address, error::Error};

sol! {
    function disableShares(bytes8[] outcomes);
    function shareImpl();
}

pub fn disable_shares(addr: Address, outcomes: &[FixedBytes<8>]) -> Result<(), Error> {
    RawCall::new()
        .call(
            addr,
            &disableSharesCall {
                outcomes: outcomes.to_vec(),
            }
            .abi_encode(),
        )
        .map_err(Error::FactoryCallError)?;
    Ok(())
}

pub fn share_impl(addr: Address) -> Result<Address, Error> {
    unpack_address(
        &RawCall::new()
            .call(addr, &shareImplCall {}.abi_encode())
            .map_err(Error::FactoryCallError)?,
    )
    .ok_or(Error::FactoryCallUnableToUnpack)
}
