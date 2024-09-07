use stylus_sdk::{
    alloy_primitives::{Address, FixedBytes, U256},
    contract, msg,
};

use crate::{erc20_call::transfer_from, error::Error, immutables::NATIVE_ASSET_ADDR};

pub fn take_from_sender(_amount: U256) -> Result<(), Error> {
    take_from_funder(msg::sender(), _amount)
}

pub fn take_from_funder(funder: Address, amount: U256) -> Result<(), Error> {
    transfer_from(NATIVE_ASSET_ADDR, funder, contract::address(), amount)
}

pub fn take_from_sender_permit(
    _value: U256,
    _v: u8,
    _r: FixedBytes<32>,
    _s: FixedBytes<32>,
) -> Result<(), Error> {
    Ok(())
}
