use stylus_sdk::{
    alloy_primitives::{Address, FixedBytes, U256},
    call::RawCall,
    alloy_sol_types::{sol, SolCall},
};

use crate::error::Error;

sol! {
    function ctor(address oracle, (bytes8,uint256)[] outcomes);
    function decide(bytes8 winner);
}

pub fn ctor(
    contract: Address,
    oracle: Address,
    outcomes: Vec<(FixedBytes<8>, U256)>,
) -> Result<(), Error> {
    RawCall::new()
        .call(contract, &ctorCall { oracle, outcomes }.abi_encode())
        .map_err(Error::TradingError)?;
    Ok(())
}

pub fn decide(contract: Address, winner: FixedBytes<8>) -> Result<(), Error> {
    RawCall::new()
        .call(contract, &decideCall { winner }.abi_encode())
        .map_err(Error::TradingError)?;
    Ok(())
}
