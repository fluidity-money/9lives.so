#![coverage(off)]

use stylus_sdk::{
    alloy_primitives::{Address, FixedBytes, U256},
    alloy_sol_types::{sol, SolCall},
    call::RawCall,
};

use alloc::vec::Vec;

use crate::{
    calldata::{unpack_details, unpack_u256},
    error::Error,
};

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

    function globalShares();

    function details(bytes8 outcome);

    function shutdown();
}

pub fn ctor(
    addr: Address,
    outcomes: Vec<FixedBytes<8>>,
    oracle: Address,
    time_start: u64,
    time_ending: u64,
    fee_recipient: Address,
    share_impl: Address,
) -> Result<(), Error> {
    let a = ctorCall {
        outcomes,
        oracle,
        timeStart: time_start,
        timeEnding: time_ending,
        feeRecipient: fee_recipient,
        shareImpl: share_impl,
    }
    .abi_encode();
    RawCall::new().call(addr, &a).map_err(Error::TradingError)?;
    Ok(())
}

pub fn decide(addr: Address, winner: FixedBytes<8>) -> Result<U256, Error> {
    let a = decideCall { winner }.abi_encode();
    unpack_u256(&RawCall::new().call(addr, &a).map_err(Error::TradingError)?)
        .ok_or(Error::TradingUnableToUnpack)
}

pub fn global_shares(addr: Address) -> Result<U256, Error> {
    unpack_u256(
        &RawCall::new()
            .call(addr, &globalSharesCall {}.abi_encode())
            .map_err(Error::TradingError)?,
    )
    .ok_or(Error::TradingUnableToUnpack)
}

pub fn details(
    addr: Address,
    outcome_id: FixedBytes<8>,
) -> Result<(U256, U256, U256, FixedBytes<8>), Error> {
    unpack_details(
        &RawCall::new()
            .call(
                addr,
                &detailsCall {
                    outcome: outcome_id,
                }
                .abi_encode(),
            )
            .map_err(Error::TradingError)?,
    )
    .ok_or(Error::TradingUnableToUnpack)
}

pub fn shutdown(addr: Address) -> Result<U256, Error> {
    unpack_u256(
        &RawCall::new()
            .call(addr, &[])
            .map_err(Error::TradingError)?,
    )
    .ok_or(Error::TradingUnableToUnpack)
}
