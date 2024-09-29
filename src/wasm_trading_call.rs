use stylus_sdk::{
    alloy_primitives::{Address, FixedBytes, U256},
    call::RawCall,
};

use crate::trading_cd::pack_ctor;

use crate::error::Error;

pub fn ctor(
    contract: Address,
    oracle: Address,
    outcomes: Vec<(FixedBytes<8>, U256)>,
) -> Result<(), Error> {
    RawCall::new()
        .call(contract, &pack_ctor(oracle, outcomes))
        .map_err(Error::TradingError)?;
    Ok(())
}
