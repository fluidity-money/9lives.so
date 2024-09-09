// Trading contains the actual behaviour of the DPM, including the
// functions to mint, and the ability for the oracle to disable the
// trading.

use stylus_sdk::{
    alloy_primitives::{aliases::*, *},
    msg,
    prelude::*,
    storage::*,
};

use astro_float::RoundingMode;

use crate::{
    error::*,
    float::{self, StorageBigFloat},
    fusdc_call,
    immutables::*,
    maths,
};

#[solidity_storage]
#[entrypoint]
pub struct Trading {
    created: StorageBool,

    // Outcome was determined! It should be impossible to mint, only to burn.
    locked: StorageBool,

    // Oracle responsible for determine the outcome.
    oracle: StorageAddress,

    // Factory that created this trading pool.
    factory: StorageAddress,

    // Shares existing in every outcome.
    shares: StorageBigFloat,

    // Global amount invested to this pool of the native asset.
    invested: StorageBigFloat,

    outcomes: StorageMap<FixedBytes<8>, Outcome>,
}

#[solidity_storage]
struct Outcome {
    // Outstanding invested into this outcome.
    invested: StorageBigFloat,

    // Amount of shares in existence in this outcome.
    shares: StorageBigFloat,

    // Was this outcome the correct outcome?
    winning: StorageBool,
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
        let fusdc_amt = outcomes.iter().map(|(_, i)| i).sum::<U256>();
        assert_or!(fusdc_amt > U256::ZERO, Error::OddsMustBeSet);
        fusdc_call::take_from_funder(funder, fusdc_amt)?;
        self.invested.set(float::u256_to_float(fusdc_amt, FUSDC_DECIMALS)?);

        // Start to go through each outcome, and seed it with its initial amount.
        for (outcome_id, outcome_amt) in outcomes {
            let outcome_amt = float::u256_to_float(outcome_amt, FUSDC_DECIMALS)?;
            self.outcomes.setter(outcome_id).invested.set(outcome_amt);
        }

        self.created.set(true);
        self.factory.set(msg::sender());
        Ok(())
    }

    fn _mint(
        &mut self,
        outcome_id: FixedBytes<8>,
        value: U256,
        recipient: Address,
    ) -> Result<U256, Error> {
        assert_or!(!self.locked.get(), Error::DoneVoting);

        // Assume we already took the user's balance. Get the state of
        // everything else as u256s.
        let outcome = self.outcomes.getter(outcome_id);
        let m_1 = outcome.invested.get();
        let n_1 = outcome.shares.get();
        let n_2 = self.shares.get().sub(&n_1, float::PREC, RoundingMode::Down);
        let m_2 = self.invested.get().sub(&m_1, float::PREC, RoundingMode::Down);

        // Convert everything to floats!
        let m = float::u256_to_float(value, FUSDC_DECIMALS)?;

        // Set the global states.
        self.outcomes.setter(outcome_id).invested.set(m_1.add(&m, float::PREC, RoundingMode::Down));
        self.invested.set(self.invested.get().add(&m, float::PREC, RoundingMode::Down));

        let shares = maths::shares(&m_1, &m_2, &n_1, &n_2, &m);

        // Set the global states the output of shares.
        self.outcomes.setter(outcome_id).shares.set(n_1.add(&shares, float::PREC, RoundingMode::Down));
        self.shares.set(self.shares.get().add(&shares, float::PREC, RoundingMode::Down));

        // Get the address of the share, then mint some in line with the
        // shares we made to the user's address!

        Ok(U256::from(0))
    }

    pub fn mint(
        &mut self,
        outcome: FixedBytes<8>,
        value: U256,
        recipient: Address,
    ) -> Result<U256, Error> {
        fusdc_call::take_from_sender(value)?;
        self._mint(outcome, value, recipient)
    }

    pub fn mint_permit(
        &mut self,
        outcome: FixedBytes<8>,
        value: U256,
        recipient: Address,
        deadline: U256,
        v: u8,
        r: FixedBytes<32>,
        s: FixedBytes<32>,
    ) -> Result<U256, Error> {
        fusdc_call::take_from_sender_permit(value, deadline, v, r, s)?;
        self._mint(outcome, value, recipient)
    }

    pub fn determine(&mut self, outcome: FixedBytes<8>) -> Result<(), Error> {
        assert_or!(msg::sender() == self.oracle.get(), Error::NotOracle);
        Ok(())
    }
}
