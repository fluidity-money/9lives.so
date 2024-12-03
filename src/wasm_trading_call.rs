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
        address feeRecipient
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
) -> Result<(), Error> {
    let a = ctorCall {
        outcomes,
        oracle,
        timeStart: time_start,
        timeEnding: time_ending,
        feeRecipient: fee_recipient,
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

#[test]
fn test_pack_calldata() {
    use stylus_sdk::alloy_primitives::address;
    dbg!(const_hex::encode(
        &ctorCall {
            outcomes: vec![FixedBytes::from([1u8; 8]), FixedBytes::from([2u8; 8])],
            oracle: address!("feb6034fc7df27df18a3a6bad5fb94c0d3dcb6d5"),
            timeStart: 100,
            timeEnding: 200,
            feeRecipient: address!("b048dfe9930a022e4b78f0c699eca6f883e954ec"),
        }
        .abi_encode()
    ));
}
