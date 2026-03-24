use stylus_sdk::{
    alloy_primitives::{Address, U256},
    call::RawCall,
};

use bobcat_cd::const_keccak_sel;

use array_concat::concat_arrays;

use crate::{calldata::unpack_u256, error::Error};

const SEL_FREEZE: [u8; 4] = const_keccak_sel(b"freeze(address,uint64)");
const SEL_SLASH: [u8; 4] = const_keccak_sel(b"slash(address,uint256,address)");

pub fn freeze(addr: Address, spender: Address, until: u64) -> Result<(), Error> {
    let mut until_word = [0u8; 32];
    until_word[24..32].copy_from_slice(&until.to_be_bytes());

    let cd: [u8; 4 + 32 * 2] = concat_arrays!(
        SEL_FREEZE,
        spender.into_word().0,
        until_word
    );
    unsafe { RawCall::new().call(addr, &cd) }
        .map_err(|b| Error::LockupError(addr, b))?;
    Ok(())
}

pub fn slash(
    addr: Address,
    victim: Address,
    amount: U256,
    recipient: Address,
) -> Result<U256, Error> {
    let cd: [u8; 4 + 32 * 3] = concat_arrays!(
        SEL_SLASH,
        victim.into_word().0,
        amount.to_be_bytes::<32>(),
        recipient.into_word().0
    );
    unpack_u256(
        &unsafe { RawCall::new().call(addr, &cd) }
            .map_err(|b| Error::LockupError(addr, b))?,
    )
    .ok_or(Error::LockupUnableToUnpack)
}
