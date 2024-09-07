use stylus_sdk::{
    alloy_primitives::{Address, FixedBytes, U256},
    contract, msg,
};

use crate::{
    erc20_call::{permit, transfer_from},
    error::Error,
    immutables::FUSDC_ADDR,
};

pub fn take_from_sender(_amount: U256) -> Result<(), Error> {
    take_from_funder(msg::sender(), _amount)
}

pub fn take_from_funder(funder: Address, amount: U256) -> Result<(), Error> {
    transfer_from(FUSDC_ADDR, funder, contract::address(), amount)
}

pub fn take_from_sender_permit(
    value: U256,
    deadline: U256,
    v: u8,
    r: FixedBytes<32>,
    s: FixedBytes<32>,
) -> Result<(), Error> {
    permit(
        FUSDC_ADDR,
        contract::address(),
        msg::sender(),
        value,
        deadline,
        v,
        r,
        s,
    )
}
