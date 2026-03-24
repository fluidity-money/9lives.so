use stylus_sdk::{
    alloy_primitives::{Address, U256},
    call::RawCall,
};

use bobcat_cd::const_keccak_sel;

use crate::error::*;

use array_concat::concat_arrays;

const SEL_BORROW: [u8; 4] = const_keccak_sel(b"borrow(address,uint256)");
const SEL_REPAY: [u8; 4] = const_keccak_sel(b"repay(uint256)");
const SEL_AMM_REGISTER: [u8; 4] = const_keccak_sel(b"ammRegister(address)");
const SEL_AMM_RECEIVE: [u8; 4] = const_keccak_sel(b"ammReceive(uint256)");
const SEL_AMM_GIFT: [u8; 4] = const_keccak_sel(b"ammGift(uint256)");

pub fn borrow(addr: Address, _for: Address, amt: U256) -> Result<(), Error> {
    let cd: [u8; 4 + 32 * 2] = concat_arrays!(
        SEL_BORROW,
        _for.into_word().0,
        amt.to_be_bytes::<32>()
    );
    unsafe { RawCall::new().call(addr, &cd) }.map_err(|b| Error::VaultError(cd.to_vec(), b))?;
    Ok(())
}

pub fn repay(addr: Address, amt: U256) -> Result<(), Error> {
    let cd: [u8; 4 + 32] = concat_arrays!(
        SEL_REPAY,
        amt.to_be_bytes::<32>()
    );
    unsafe { RawCall::new().call(addr, &cd) }.map_err(|b| Error::VaultError(cd.to_vec(), b))?;
    Ok(())
}

pub fn amm_register(addr: Address, amm: Address) -> Result<(), Error> {
    let cd: [u8; 4 + 32] = concat_arrays!(
        SEL_AMM_REGISTER,
        amm.into_word().0
    );
    unsafe { RawCall::new().call(addr, &cd) }.map_err(|b| Error::VaultError(cd.to_vec(), b))?;
    Ok(())
}

pub fn amm_receive(addr: Address, amt: U256) -> Result<(), Error> {
    let cd: [u8; 4 + 32] = concat_arrays!(
        SEL_AMM_RECEIVE,
        amt.to_be_bytes::<32>()
    );
    unsafe { RawCall::new().call(addr, &cd) }.map_err(|b| Error::VaultError(cd.to_vec(), b))?;
    Ok(())
}

pub fn amm_gift(addr: Address, amt: U256) -> Result<(), Error> {
    let cd: [u8; 4 + 32] = concat_arrays!(
        SEL_AMM_GIFT,
        amt.to_be_bytes::<32>()
    );
    unsafe { RawCall::new().call(addr, &cd) }.map_err(|b| Error::VaultError(cd.to_vec(), b))?;
    Ok(())
}
