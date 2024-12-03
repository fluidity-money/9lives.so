use stylus_sdk::{
    alloy_primitives::{Address, FixedBytes},
    alloy_sol_types::{sol, SolCall},
    call::RawCall,
};

use crate::error::Error;

sol! {
    function ctor(
        bytes8[] outcomes,
        address oracle,
        uint64 timeStart,
        uint64 timeEnding,
        address feeRecipient,
        address shareImpl
    );

    function decide(bytes8 winner);
}

pub fn ctor(
    addr: Address,
    outcomes: Vec<FixedBytes<8>>,
    oracle: Address,
    time_start: u64,
    time_ending: u64,
    fee_recipient: Address,
    share_impl: Address
) -> Result<(), Error> {
    let a = ctorCall {
        outcomes,
        oracle,
        timeStart: time_start,
        timeEnding: time_ending,
        feeRecipient: fee_recipient,
        shareImpl: share_impl
    }
    .abi_encode();
    RawCall::new()
        .call(addr, &a)
        .map_err(Error::TradingError)?;
    Ok(())
}

pub fn decide(addr: Address, winner: FixedBytes<8>) -> Result<(), Error> {
    let a = decideCall { winner }.abi_encode();
    RawCall::new()
        .call(addr, &a)
        .map_err(Error::TradingError)?;
    Ok(())
}
