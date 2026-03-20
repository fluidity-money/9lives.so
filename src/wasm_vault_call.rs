use stylus_sdk::{
    alloy_primitives::{Address, U256},
    alloy_sol_types::{sol, SolCall},
    call::RawCall,
};

use crate::error::*;

sol! {
    function borrow(address _for, uint256 amount);
    function repay(uint256 feesEarned);
    function ammRegister(address _amm);
    function ammReceive(uint256 _amount);
    function ammGift(uint256 _amount);
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

pub fn amm_register(addr: Address, amm: Address) -> Result<(), Error> {
    unsafe { RawCall::new().call(addr, &ammRegisterCall { _amm: amm }.abi_encode()) }
        .map_err(|b| Error::VaultError(b))?;
    Ok(())
}

pub fn amm_receive(addr: Address, amt: U256) -> Result<(), Error> {
    unsafe { RawCall::new().call(addr, &ammReceiveCall { _amount: amt }.abi_encode()) }
        .map_err(|b| Error::VaultError(b))?;
    Ok(())
}

pub fn amm_gift(addr: Address, amt: U256) -> Result<(), Error> {
    unsafe { RawCall::new().call(addr, &ammGiftCall { _amount: amt }.abi_encode()) }
        .map_err(|b| Error::VaultError(b))?;
    Ok(())
}
