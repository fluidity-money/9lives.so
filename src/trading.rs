// Trading contains the actual behaviour of the DPM, including the
// functions to mint, and the ability for the oracle to disable the
// trading.

use stylus_sdk::{
    alloy_primitives::{aliases::*, *},
    prelude::*,
    storage::*,
};

use crate::error::*;

#[solidity_storage]
#[entrypoint]
pub struct Trading {
    // Factory that created this trading pool.
    factory: StorageAddress,

    // Global amount invested to this pool of the native asset.
    money_invested: StorageU256,

    outcomes: StorageMap<FixedBytes<8>, Outcome>
}

#[solidity_storage]
struct Outcome {
    // Amount invested into this outcome.
    money_invested: StorageU256,

    // Amount of shares in existence in this outcome.
    shares: StorageI64,
}

#[external]
impl Trading {
    // Seeds the pool with the first outcome. Assumes msg.sender is the factory.
    pub fn ctor(outcomes: Vec<FixedBytes<8>>, seeds: Vec<i64>) -> Result<(), Error> {
        Ok(())
    }
}
