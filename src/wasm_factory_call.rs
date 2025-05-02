use stylus_sdk::{
    alloy_primitives::{Address, FixedBytes},
    alloy_sol_types::{sol, SolCall},
    call::RawCall,
};

use crate::error::Error;

sol! {
    function disableShares(bytes8[] outcomes);
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
