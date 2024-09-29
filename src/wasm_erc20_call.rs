use stylus_sdk::{
    alloy_primitives::{Address, FixedBytes, U256},
    call::RawCall,
};

use crate::{
    calldata::{unpack_bool_safe, unpack_u256},
    erc20_cd::{pack_transfer, pack_balance_of, pack_permit, pack_transfer_from},
    error::Error,
};

pub fn transfer(addr: Address, recipient: Address, value: U256) -> Result<(), Error> {
    unpack_bool_safe(
        &RawCall::new()
            .call(addr, &pack_transfer(recipient, value))
            .map_err(Error::ERC20Error)?,
    )
}

pub fn transfer_from(
    addr: Address,
    spender: Address,
    recipient: Address,
    amount: U256,
) -> Result<(), Error> {
    unpack_bool_safe(
        &RawCall::new()
            .call(addr, &pack_transfer_from(spender, recipient, amount))
            .map_err(Error::ERC20Error)?,
    )
}

pub fn permit(
    addr: Address,
    owner: Address,
    spender: Address,
    value: U256,
    deadline: U256,
    v: u8,
    r: FixedBytes<32>,
    s: FixedBytes<32>,
) -> Result<(), Error> {
    unpack_bool_safe(
        &RawCall::new()
            .call(addr, &pack_permit(owner, spender, value, deadline, v, r, s))
            .map_err(Error::ERC20Error)?,
    )
}

pub fn balance_of(addr: Address, spender: Address) -> Result<U256, Error> {
    unpack_u256(
        &RawCall::new_static()
            .call(addr, &pack_balance_of(spender))
            .map_err(Error::ERC20Error)?,
    )
    .ok_or(Error::ERC20UnableToUnpack)
}
