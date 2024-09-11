use stylus_sdk::{
    alloy_primitives::{Address, U256},
    call::RawCall,
};

use crate::{
    error::Error,
    immutables::LONGTAIL_ADDR,
    longtail_cd::{pack_create_pool, pack_enable_pool},
};

pub fn create_pool(
    erc20: Address,
    price: U256,
    fee: u32,
    spacing: u8,
    liq_per_tick: u128,
) -> Result<(), Error> {
    RawCall::new()
        .call(
            LONGTAIL_ADDR,
            &pack_create_pool(erc20, price, fee, spacing, liq_per_tick),
        )
        .map_err(Error::LongtailError)?;
    Ok(())
}

pub fn pause_pool(erc20: Address) -> Result<(), Error> {
    RawCall::new()
        .call(LONGTAIL_ADDR, &pack_enable_pool(erc20, false))
        .map_err(Error::LongtailError)?;
    Ok(())
}