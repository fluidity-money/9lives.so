
use alloy_sol_macro::sol;

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
    let  (tokenA, tokenB) = if erc20 > FUSDC_ADDRESS {
        FUSDC_ADDR, erc20
    } else {
        erc20, FUSDC_ADDR
    };
    RawCall::new()
        .call(
            LONGTAIL_ADDR,
            &createPoolCall {
                tokenA,
                tokenB
            }.abi_encode()
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
