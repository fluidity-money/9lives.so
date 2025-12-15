use stylus_sdk::{
    alloy_primitives::{Address, U256},
    alloy_sol_types::{sol, SolCall},
    call::RawCall,
};

use crate::error::*;

sol! {
    function borrow(address _for, uint256 amount);
    function repay(uint256 feesEarned);
}

pub fn borrow(addr: Address, _for: Address, amt: U256) -> Result<(), Error> {
    unsafe { RawCall::new().call(addr, &borrowCall { _for, amount: amt }.abi_encode()) }
        .map_err(|b| Error::VaultError(b))?;
    Ok(())
}

pub fn repay(addr: Address, amt: U256) -> Result<(), Error> {
    unsafe { RawCall::new().call(addr, &repayCall { feesEarned: amt }.abi_encode()) }
        .map_err(|b| Error::VaultError(b))?;
    Ok(())
}
