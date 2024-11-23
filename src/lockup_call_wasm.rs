use stylus_sdk::alloy_primitives::{Address, U256};

use alloy_sol_macro::sol;

use crate::error::Error;

sol! {
    function freeze(address spender, uint256 until) external;
}

pub fn freeze(addr: Address, spender: Address, until: U256) -> Result<(), Error> {
    RawCall::new(addr, &freezeCall { spender, until }.abi_encode())
        .map_err(|b| Error::LockupError(addr, b))?;
    Ok(())
}
