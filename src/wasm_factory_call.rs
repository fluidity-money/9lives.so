use stylus_sdk::{
    alloy_primitives::{Address, FixedBytes},
    call::RawCall,
};

use crate::error::Error;

use crate::factory_cd::*;

pub fn disable_shares(addr: Address, outcomes: &[FixedBytes<8>]) -> Result<(), Error> {
    RawCall::new()
        .call(addr, &pack_disable_shares(outcomes))
        .map_err(Error::LongtailError)?;
    Ok(())
}
