use crate::{error::Error, immutables::*};

use stylus_sdk::{
    alloy_primitives::{Address, U256},
    call::RawCall,
};

use alloy_sol_macro::sol;

use alloy_sol_types::SolCall;

sol! {
    function createPool(address tokenA, address tokenB);
}

pub fn create_pool(
    erc20: Address,
    _price: U256,
    _fee: u32,
    _spacing: u8,
    _liq_per_tick: u128,
) -> Result<Address, Error> {
    // We don't do much aside from take the ERC20 and fUSDC address for this.
    let (token_a, token_b) = if erc20 > FUSDC_ADDR {
        (FUSDC_ADDR, erc20)
    } else {
        (erc20, FUSDC_ADDR)
    };
    RawCall::new()
        .call(
            AMM_ADDR,
            &createPoolCall {
                tokenA: token_a,
                tokenB: token_b,
            }
            .abi_encode(),
        )
        .map_err(Error::CamelotError)?;
    Ok(erc20)
}

/// Stubbed out enable pool code! Camelot we can't control like this.
pub fn enable_pool(_erc20: Address) -> Result<(), Error> {
    Ok(())
}

/// Stubbed out pause pool code! Camelot we can't control like this.
pub fn pause_pool(_erc20: Address) -> Result<(), Error> {
    Ok(())
}
