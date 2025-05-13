use stylus_sdk::{
    alloy_primitives::{Address, U256},
    alloy_sol_types::{sol, SolCall},
    call::RawCall,
};

use crate::{calldata::unpack_u256, error::Error};

sol! {
    function freeze(address spender, uint64 until);
    function slash(address victim, uint256 amount, address recipient);
}

pub fn freeze(addr: Address, spender: Address, until: u64) -> Result<(), Error> {
    unsafe {
        RawCall::new()
            .call(addr, &freezeCall { spender, until }.abi_encode())
            .map_err(|b| Error::LockupError(addr, b))?
    };
    Ok(())
}

pub fn slash(
    addr: Address,
    victim: Address,
    amount: U256,
    recipient: Address,
) -> Result<U256, Error> {
    unpack_u256(&unsafe {
        RawCall::new()
            .call(
                addr,
                &slashCall {
                    victim,
                    amount,
                    recipient,
                }
                .abi_encode(),
            )
            .map_err(|b| Error::LockupError(addr, b))?
    })
    .ok_or(Error::LockupUnableToUnpack)
}
