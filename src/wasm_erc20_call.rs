use stylus_sdk::{
    alloy_primitives::{Address, FixedBytes, U256},
    alloy_sol_types::{sol, SolCall},
    call::RawCall,
};

use crate::{
    calldata::{unpack_bool_safe, unpack_u256},
    error::Error,
};

sol! {
    function transfer(address recipient, uint256 value);
    function transferFrom(address spender, address recipient, uint256 amount);
    function permit(address owner, address spender, uint256 value, uint256 deadline, uint8 v, bytes32 r, bytes32 s);
    function balanceOf(address spender);
    function approve(address spender, uint256 amount);
}

pub fn transfer(addr: Address, recipient: Address, value: U256) -> Result<(), Error> {
    unpack_bool_safe(
        &{ RawCall::new().call(addr, &transferCall { recipient, value }.abi_encode()) }
            .map_err(|b| Error::ERC20ErrorTransfer(addr, b))?,
    )
}

pub fn transfer_from(
    addr: Address,
    spender: Address,
    recipient: Address,
    amount: U256,
) -> Result<(), Error> {
    unpack_bool_safe(
        &{
            RawCall::new().call(
                addr,
                &transferFromCall {
                    spender,
                    recipient,
                    amount,
                }
                .abi_encode(),
            )
        }
        .map_err(|_| Error::ERC20ErrorTransferFrom(addr, spender, recipient, amount))?,
    )
}

#[allow(clippy::too_many_arguments)]
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
        &{
            RawCall::new().call(
                addr,
                &permitCall {
                    owner,
                    spender,
                    value,
                    deadline,
                    v,
                    r,
                    s,
                }
                .abi_encode(),
            )
        }
        .map_err(|b| Error::ERC20ErrorPermit(addr, b))?,
    )
}

pub fn balance_of(addr: Address, spender: Address) -> Result<U256, Error> {
    unpack_u256(
        &{ RawCall::new_static().call(addr, &balanceOfCall { spender }.abi_encode()) }
            .map_err(|b| Error::ERC20ErrorBalanceOf(addr, b))?,
    )
    .ok_or(Error::ERC20UnableToUnpack)
}

pub fn approve(addr: Address, spender: Address, amount: U256) -> Result<(), Error> {
    unpack_bool_safe(
        &{ RawCall::new().call(addr, &approveCall { spender, amount }.abi_encode()) }
            .map_err(|_| Error::ERC20Approve)?,
    )
}
