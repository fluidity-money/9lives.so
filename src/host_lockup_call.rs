use stylus_sdk::alloy_primitives::{Address, U256};

use crate::{
    erc20_call,
    error::Error,
    testing_addrs::{LOCKUP_CONTRACT, STAKED_ARB},
    utils::contract_address,
};

pub fn freeze(_addr: Address, _spender: Address, _until: U256) -> Result<(), Error> {
    Ok(())
}

/// In the host environment, we reduce a victim's amount by transferring
/// from LOCKUP to the recipient. We assume the tester has validated that
/// slashing is taking place where applicable.
pub fn slash(
    _addr: Address,
    _victim: Address,
    amount: U256,
    recipient: Address,
) -> Result<U256, Error> {
    erc20_call::transfer_from(STAKED_ARB, LOCKUP_CONTRACT, recipient, amount)?;
    Ok(amount)
}
