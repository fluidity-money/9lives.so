use stylus_sdk::alloy_primitives::{Address, U256};

use alloy_sol_macro::sol;

use crate::error::Error;

sol! {
    function freeze(address spender, uint256 until);
    function stakedArbBal(address holder);
}

pub fn freeze(addr: Address, spender: Address, until: U256) -> Result<(), Error> {
    RawCall::new(addr, &freezeCall { spender, until }.abi_encode())
        .map_err(|b| Error::LockupError(addr, b))?;
    Ok(())
}

pub fn staked_arb_bal(addr: Address, holder: Address) -> Result<(), Error> {
    RawCall::new(addr, &stakedArbBalCall { holder }.abi_encode())
        .map_err(|b| Error::LockupError(addr, b))?;
    Ok(())
}
