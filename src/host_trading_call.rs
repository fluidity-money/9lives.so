use stylus_sdk::alloy_primitives::{Address, FixedBytes, U256};

use alloc::vec::Vec;

use crate::error::Error;

#[allow(clippy::too_many_arguments)]
pub fn ctor(
    _addr: Address,
    _outcomes: Vec<FixedBytes<8>>,
    _oracle: Address,
    _time_start: u64,
    _time_ending: u64,
    _fee_recipient: Address,
    _share_impl: Address,
    _should_buffer_time: bool,
    _fee_creator: u64,
    _fee_lp: u64,
    _fee_minter: u64,
    _fee_referrer: u64,
) -> Result<(), Error> {
    Ok(())
}

pub fn decide(_contract: Address, _winner: FixedBytes<8>) -> Result<U256, Error> {
    Ok(U256::ZERO)
}

pub fn global_shares(_addr: Address) -> Result<U256, Error> {
    Ok(U256::ZERO)
}

pub fn details(
    _addr: Address,
    _outcome_id: FixedBytes<8>,
) -> Result<(U256, U256, U256, FixedBytes<8>), Error> {
    Ok((U256::ZERO, U256::ZERO, U256::ZERO, FixedBytes::ZERO))
}

pub fn escape(_addr: Address) -> Result<(), Error> {
    Ok(())
}

pub fn time_ending(_addr: Address) -> Result<u64, Error> {
    Ok(0)
}
