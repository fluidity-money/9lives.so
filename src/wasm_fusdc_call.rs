use stylus_sdk::{
    alloy_primitives::{Address, FixedBytes, U256},
    contract, msg,
};

use crate::{
    erc20_call::{self, permit, transfer_from},
    error::Error,
    immutables::FUSDC_ADDR,
};

pub fn take_from_sender(_amount: U256) -> Result<(), Error> {
    take_from_funder(msg_sender(), _amount)
}

pub fn take_from_funder(funder: Address, amount: U256) -> Result<(), Error> {
    transfer_from(FUSDC_ADDR, funder, contract::address(), amount)
}

pub fn transfer(recipient: Address, value: U256) -> Result<(), Error> {
    erc20_call::transfer(FUSDC_ADDR, recipient, value)
}
