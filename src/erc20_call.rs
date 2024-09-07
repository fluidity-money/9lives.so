use stylus_sdk::{
    alloy_primitives::{Address, U256},
    call::RawCall,
};

use crate::{calldata::unpack_bool_safe, erc20_cd::pack_transfer_from, error::Error};

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
