use stylus_sdk::{
    alloy_primitives::{Address, FixedBytes, U256},
    alloy_sol_types::{sol, SolCall},
    call::RawCall,
};

use crate::error::Error;

sol! {
    function ctor(
        (bytes8,uint256)[] outcomes,
        address oracle,
        uint64 timeStart,
        uint64 timeEnding,
        address feeRecipient
    );

    function decide(bytes8 winner);
}

pub fn ctor(
    contract: Address,
    outcomes: Vec<(FixedBytes<8>, U256)>,
    oracle: Address,
    time_start: u64,
    time_ending: u64,
    fee_recipient: Address,
) -> Result<(), Error> {
    RawCall::new()
        .call(
            contract,
            &ctorCall {
                outcomes,
                oracle,
                timeStart: time_start,
                timeEnding: time_ending,
                feeRecipient: fee_recipient,
            }
            .abi_encode(),
        )
        .map_err(Error::TradingError)?;
    Ok(())
}

pub fn decide(contract: Address, winner: FixedBytes<8>) -> Result<(), Error> {
    RawCall::new()
        .call(contract, &decideCall { winner }.abi_encode())
        .map_err(Error::TradingError)?;
    Ok(())
}
