#![cfg(not(target_arch = "wasm32"))]

use stylus_sdk::alloy_primitives::{Address, U256};

use crate::{error::Error, host_erc20_call, testing_addrs};

pub fn borrow(addr: Address, for_: Address, amt: U256) -> Result<(), Error> {
    host_erc20_call::test_give_tokens(addr, for_, amt);
    Ok(())
}

pub fn repay(addr: Address, amt: U256) -> Result<(), Error> {
    host_erc20_call::transfer_from(addr, testing_addrs::CONTRACT, testing_addrs::VAULT, amt)
}

pub fn amm_register(_addr: Address, _amm: Address) -> Result<(), Error> {
    Ok(())
}

pub fn amm_receive(_addr: Address, _amt: U256) -> Result<(), Error> {
    Ok(())
}

pub fn amm_gift(_addr: Address, _amt: U256) -> Result<(), Error> {
    Ok(())
}
