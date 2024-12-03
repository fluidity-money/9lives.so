use stylus_sdk::{
    alloy_primitives::{Address, FixedBytes, U256},
    contract,
};

use crate::{
    erc20_call::{self, permit, transfer_from},
    error::Error,
    immutables::FUSDC_ADDR,
    utils::msg_sender,
};

pub fn take_from_funder_to(funder: Address, recipient: Address, amount: U256) -> Result<(), Error> {
    transfer_from(FUSDC_ADDR, funder, recipient, amount)
}

pub fn take_from_sender_to(recipient: Address, amount: U256) -> Result<(), Error> {
    take_from_funder_to(msg_sender(), recipient, amount)
}

pub fn take_from_sender(amount: U256) -> Result<(), Error> {
    take_from_funder_to(msg_sender(), contract::address(), amount)
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
        msg_sender(),
        value,
        deadline,
        v,
        r,
        s,
    )
}

pub fn transfer(recipient: Address, value: U256) -> Result<(), Error> {
    erc20_call::transfer(FUSDC_ADDR, recipient, value)
}
