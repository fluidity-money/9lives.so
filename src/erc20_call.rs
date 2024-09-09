use stylus_sdk::{
    alloy_primitives::{Address, FixedBytes, U256},
    call::RawCall,
};

use crate::{
    calldata::{unpack_bool_safe},
    erc20_cd::{pack_permit, pack_transfer_from},
    error::Error,
};

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
