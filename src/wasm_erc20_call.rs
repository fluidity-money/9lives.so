use stylus_sdk::{
    alloy_primitives::{Address, FixedBytes, U256},
    call::RawCall,
};

use bobcat_cd::const_keccak_sel;

use array_concat::concat_arrays;

use crate::{
    calldata::{unpack_bool_safe, unpack_u256},
    error::Error,
};

const SEL_TRANSFER: [u8; 4] = const_keccak_sel(b"transfer(address,uint256)");
const SEL_TRANSFER_FROM: [u8; 4] =
    const_keccak_sel(b"transferFrom(address,address,uint256)");
const SEL_PERMIT: [u8; 4] =
    const_keccak_sel(b"permit(address,address,uint256,uint256,uint8,bytes32,bytes32)");
const SEL_BALANCE_OF: [u8; 4] = const_keccak_sel(b"balanceOf(address)");
const SEL_APPROVE: [u8; 4] = const_keccak_sel(b"approve(address,uint256)");

pub fn transfer(addr: Address, recipient: Address, value: U256) -> Result<(), Error> {
    let cd: [u8; 4 + 32 * 2] = concat_arrays!(
        SEL_TRANSFER,
        recipient.into_word().0,
        value.to_be_bytes::<32>()
    );
    unpack_bool_safe(
        &unsafe { RawCall::new().call(addr, &cd) }
            .map_err(|b| Error::ERC20ErrorTransfer(value, addr, b))?,
    )
}

pub fn transfer_from(
    addr: Address,
    spender: Address,
    recipient: Address,
    amount: U256,
) -> Result<(), Error> {
    let cd: [u8; 4 + 32 * 3] = concat_arrays!(
        SEL_TRANSFER_FROM,
        spender.into_word().0,
        recipient.into_word().0,
        amount.to_be_bytes::<32>()
    );
    unpack_bool_safe(
        &unsafe { RawCall::new().call(addr, &cd) }
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
    let mut v_word = [0u8; 32];
    v_word[31] = v;

    let cd: [u8; 4 + 32 * 7] = concat_arrays!(
        SEL_PERMIT,
        owner.into_word().0,
        spender.into_word().0,
        value.to_be_bytes::<32>(),
        deadline.to_be_bytes::<32>(),
        v_word,
        r.0,
        s.0
    );
    unpack_bool_safe(
        &unsafe { RawCall::new().call(addr, &cd) }
            .map_err(|b| Error::ERC20ErrorPermit(addr, b))?,
    )
}

pub fn balance_of(addr: Address, spender: Address) -> Result<U256, Error> {
    let cd: [u8; 4 + 32] = concat_arrays!(
        SEL_BALANCE_OF,
        spender.into_word().0
    );
    unpack_u256(
        &unsafe { RawCall::new().call(addr, &cd) }
            .map_err(|b| Error::ERC20ErrorBalanceOf(addr, b))?,
    )
    .ok_or(Error::ERC20UnableToUnpack)
}

pub fn approve(addr: Address, spender: Address, amount: U256) -> Result<(), Error> {
    let cd: [u8; 4 + 32 * 2] = concat_arrays!(
        SEL_APPROVE,
        spender.into_word().0,
        amount.to_be_bytes::<32>()
    );
    unpack_bool_safe(
        &unsafe { RawCall::new().call(addr, &cd) }
            .map_err(|_| Error::ERC20Approve)?,
    )
}