// Trading contains the actual behaviour of the DPM, including the
// functions to mint, and the ability for the oracle to disable the
// trading.

use stylus_sdk::{
    alloy_primitives::{aliases::*, *},
    msg,
    prelude::*,
    storage::*,
};

use crate::{error::*, fusdc};

#[solidity_storage]
#[entrypoint]
pub struct Trading {
    created: StorageBool,

    // Factory that created this trading pool.
    factory: StorageAddress,

    // Global amount invested to this pool of the native asset.
    money_invested: StorageU256,

    outcomes: StorageMap<FixedBytes<8>, Outcome>,
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
    // Seeds the pool with the first outcome. Assumes msg.sender is
    // the factory. Seeder is the address to take the money from. It
    // should have the approval done beforehand with its own
    // estimation of the address based on the CREATE2 process.
    pub fn ctor(
        &mut self,
        oracle: Address,
        funder: Address,
        outcomes: Vec<(FixedBytes<8>, U256)>,
    ) -> Result<(), Vec<u8>> {
        assert_or!(!self.created.get(), Error::AlreadyConstructed);

        // A risk involved with this might be someone creating a EOA at
        // the address that would be derived with CREATE2, then
        // transferring money out. But that's not likely in practice as the
        // amount needed to seed is super low, and it's hard to predict
        // the details needed for this CREATE2.
        let fusdc_amount = outcomes.iter().map(|(_, i)| i).sum::<U256>();
        assert_or!(fusdc_amount > U256::ZERO, Error::OddsMustBeSet);
        fusdc::take_from_sender(funder, fusdc_amount)?;

        // Start to go through each outcome, and seed it with its initial amount.
        for (outcome_id, outcome_amount) in outcomes {

        }

        self.created.set(true);
        self.factory.set(msg::sender());
        Ok(())
    }
}
