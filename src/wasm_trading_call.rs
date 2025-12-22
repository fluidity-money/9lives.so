use stylus_sdk::{
    alloy_primitives::{Address, FixedBytes, U256},
    alloy_sol_types::{sol, SolCall},
    call::RawCall,
};

use alloc::vec::Vec;

use crate::{
    calldata::{unpack_bool, unpack_details, unpack_outcome_list, unpack_u256, unpack_u64},
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
    should_buffer_time: bool,
    fee_creator: u64,
    fee_lp: u64,
    fee_minter: u64,
    fee_referrer: u64,
    starting_liq: U256
) -> Result<(), Error> {
    let a = ctorCall {
        ctorArgs: CtorArgs {
            outcomes,
            oracle,
            timeStart: time_start,
            timeEnding: time_ending,
            feeRecipient: fee_recipient,
            shouldBufferTime: should_buffer_time,
            feeCreator: fee_creator,
            feeLp: fee_lp,
            feeMinter: fee_minter,
            feeReferrer: fee_referrer,
            startingLiq: starting_liq
        },
    }
    .abi_encode();
    unsafe {
        RawCall::new()
            .call(addr, &a)
            .map_err(Error::TradingErrorCtor)?
    };
    Ok(())
}

pub fn decide(addr: Address, winner: FixedBytes<8>) -> Result<U256, Error> {
    let a = decideCall { outcome: winner }.abi_encode();
    let b = unsafe {
        RawCall::new()
            .call(addr, &a)
            .map_err(Error::TradingErrorDecide)?
    };
    unpack_u256(&b).ok_or(Error::TradingUnableToUnpack(addr, b))
}

pub fn global_shares(addr: Address) -> Result<U256, Error> {
    let b = unsafe {
        RawCall::new()
            .call(addr, &globalSharesCall {}.abi_encode())
            .map_err(Error::TradingErrorGlobalShares)?
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
            .map_err(Error::TradingErrorDetails)?
    };
    unpack_details(&b).ok_or(Error::TradingUnableToUnpack(addr, b))
}

pub fn escape(addr: Address) -> Result<(), Error> {
    unsafe {
        RawCall::new()
            .call(addr, &escapeCall {}.abi_encode())
            .map_err(Error::TradingErrorEscape)?
    };
    Ok(())
}

pub fn time_ending(addr: Address) -> Result<u64, Error> {
    let b = unsafe {
        RawCall::new()
            .call(addr, &timeEndingCall {}.abi_encode())
            .map_err(Error::TradingErrorTimeEnding)?
    };
    unpack_u64(&b).ok_or(Error::TradingUnableToUnpack(addr, b))
}

pub fn add_liquidity(
    addr: Address,
    amt: U256,
    recipient: Address,
    min_liquidity: U256,
    max_shares: U256,
) -> Result<U256, Error> {
    let b = unsafe {
        RawCall::new()
            .call(
                addr,
                &addLiquidityB9DDA952Call {
                    liquidity: amt,
                    recipient,
                    minShares: min_liquidity,
                    maxShares: max_shares,
                }
                .abi_encode(),
            )
            .map_err(Error::TradingErrorAddLiq)?
    };
    unpack_u256(&b).ok_or(Error::TradingUnableToUnpack(addr, b))
}

pub fn outcome_list(addr: Address) -> Result<Vec<FixedBytes<8>>, Error> {
    let b = unsafe {
        RawCall::new()
            .call(addr, &outcomeListCall {}.abi_encode())
            .map_err(Error::TradingErrorOutcomeList)?
    };
    unpack_outcome_list(&b).ok_or(Error::TradingUnableToUnpack(addr, b))
}

pub fn is_dppm(addr: Address) -> Result<bool, Error> {
    let b = unsafe {
        RawCall::new()
            .call(addr, &isDpmCall {}.abi_encode())
            .map_err(Error::TradingErrorIsDppm)?
    };
    unpack_bool(&b).ok_or(Error::TradingUnableToUnpack(addr, b))
}

pub fn price(addr: Address, outcome: FixedBytes<8>) -> Result<U256, Error> {
    let b = unsafe {
        RawCall::new()
            .call(addr, &priceA827ED27Call { outcome }.abi_encode())
            .map_err(Error::TradingErrorPrice)?
    };
    unpack_u256(&b).ok_or(Error::TradingUnableToUnpack(addr, b))
}