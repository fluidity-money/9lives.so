use stylus_sdk::{
    alloy_primitives::{Address, FixedBytes, U256},
    alloy_sol_types::{sol, SolCall},
    call::RawCall,
};

use alloc::vec::Vec;

use crate::{
    calldata::{unpack_details, unpack_u256, unpack_u64},
    error::Error,
};

sol!("./src/INineLivesTrading.sol");
use INineLivesTrading::*;

#[allow(clippy::too_many_arguments)]
pub fn ctor(
    addr: Address,
    outcomes: Vec<FixedBytes<8>>,
    oracle: Address,
    time_start: u64,
    time_ending: u64,
    fee_recipient: Address,
    share_impl: Address,
    should_buffer_time: bool,
    fee_creator: u64,
    fee_lp: u64,
    fee_minter: u64,
    fee_referrer: u64,
) -> Result<(), Error> {
    let a = ctorCall {
        ctorArgs: CtorArgs {
            outcomes,
            oracle,
            timeStart: time_start,
            timeEnding: time_ending,
            feeRecipient: fee_recipient,
            shareImpl: share_impl,
            shouldBufferTime: should_buffer_time,
            feeCreator: fee_creator,
            feeLp: fee_lp,
            feeMinter: fee_minter,
            feeReferrer: fee_referrer,
        },
    }
    .abi_encode();
    unsafe { RawCall::new().call(addr, &a).map_err(Error::TradingError)? };
    Ok(())
}

pub fn decide(addr: Address, winner: FixedBytes<8>) -> Result<U256, Error> {
    let a = decideCall { outcome: winner }.abi_encode();
    let b = unsafe { RawCall::new().call(addr, &a).map_err(Error::TradingError)? };
    unpack_u256(&b).ok_or(Error::TradingUnableToUnpack(addr, b))
}

pub fn global_shares(addr: Address) -> Result<U256, Error> {
    let b = unsafe {
        RawCall::new()
            .call(addr, &globalSharesCall {}.abi_encode())
            .map_err(Error::TradingError)?
    };
    unpack_u256(&b).ok_or(Error::TradingUnableToUnpack(addr, b))
}

pub fn details(
    addr: Address,
    outcome_id: FixedBytes<8>,
) -> Result<(U256, U256, U256, FixedBytes<8>), Error> {
    let b = unsafe {
        RawCall::new()
            .call(
                addr,
                &detailsCall {
                    outcomeId: outcome_id,
                }
                .abi_encode(),
            )
            .map_err(Error::TradingError)?
    };
    unpack_details(&b).ok_or(Error::TradingUnableToUnpack(addr, b))
}

pub fn escape(addr: Address) -> Result<(), Error> {
    unsafe {
        RawCall::new()
            .call(addr, &escapeCall {}.abi_encode())
            .map_err(Error::TradingError)?
    };
    Ok(())
}

pub fn time_ending(addr: Address) -> Result<u64, Error> {
    let b = unsafe {
        RawCall::new()
            .call(addr, &timeEndingCall {}.abi_encode())
            .map_err(Error::TradingError)?
    };
    unpack_u64(&b).ok_or(Error::TradingUnableToUnpack(addr, b))
}

pub fn add_liquidity(addr: Address, amt: U256, recipient: Address) -> Result<U256, Error> {
    let b = unsafe {
        RawCall::new()
            .call(
                addr,
                &addLiquidityA975D995Call {
                    liquidity: amt,
                    recipient,
                }
                .abi_encode(),
            )
            .map_err(Error::TradingError)?
    };
    unpack_u256(&b).ok_or(Error::TradingUnableToUnpack(addr, b))
}
