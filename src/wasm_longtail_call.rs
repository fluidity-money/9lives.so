use stylus_sdk::{
    alloy_primitives::{Address, U256},
    alloy_sol_types::{sol, SolCall},
    call::RawCall,
};

use crate::{error::Error, immutables::LONGTAIL_ADDR};

sol!("src/ILongtail.sol");

pub fn create_pool(pool: Address, price: U256, fee: u32) -> Result<Address, Error> {
    c!(unsafe {
        RawCall::new()
            .call(
                LONGTAIL_ADDR,
                &ILongtail::createPool653F395ECall { pool, price, fee }.abi_encode(),
            )
            .map_err(Error::LongtailError)
    });
    Ok(pool)
}

fn adjust_pool(pool: Address, enabled: bool) -> Result<(), Error> {
    c!(unsafe {
        RawCall::new()
            .call(
                LONGTAIL_ADDR,
                &ILongtail::enablePool579DA658Call { pool, enabled }.abi_encode(),
            )
            .map_err(Error::LongtailError)
    });
    Ok(())
}

pub fn enable_pool(pool: Address) -> Result<(), Error> {
    adjust_pool(pool, true)
}

pub fn pause_pool(pool: Address) -> Result<(), Error> {
    adjust_pool(pool, false)
}
