// Trading contains the actual behaviour of the DPM, including the
// functions to mint, and the ability for the oracle to disable the
// trading.

use stylus_sdk::{
    alloy_primitives::{aliases::*, *},
    contract, msg,
    prelude::*,
    storage::*,
};

use crate::{
    error::*,
    factory_call,
    fixed::{fixed_to_u256, u256_to_fixed, StorageFixed},
    fusdc_call,
    immutables::*,
    maths, proxy, share_call,
};

use fixed::types::I96F32;

#[storage]
#[cfg_attr(all(target_arch = "wasm32", feature = "trading"), entrypoint)]
pub struct Trading {
    // Outcome was determined! It should be impossible to mint, only to burn.
    locked: StorageBool,

    // Oracle responsible for determine the outcome.
    oracle: StorageAddress,

    // Factory that created this trading pool. Empty if not created!
    factory: StorageAddress,

    // Shares existing in every outcome.
    shares: StorageFixed,

    // Global amount invested to this pool of the native asset.
    invested: StorageFixed,

    outcomes: StorageMap<FixedBytes<8>, Outcome>,

    // Outcomes tracked to be disabled with Longtail once a winner is found.
    outcome_list: StorageVec<StorageFixedBytes<8>>,

    // Has the outcome here been determined using the determine function?
    decided: StorageBool,
}

#[storage]
struct Outcome {
    // Outstanding invested into this outcome.
    invested: StorageFixed,

    // Amount of shares in existence in this outcome.
    shares: StorageFixed,

    // Was this outcome the correct outcome?
    winner: StorageBool,
}

#[public]
impl Trading {
    // Seeds the pool with the first outcome. Assumes msg.sender is
    // the factory. Seeder is the address to take the money from. It
    // should have the approval done beforehand with its own
    // estimation of the address based on the CREATE2 process.
    // Does not prevent a user from submitting the same outcome twice!
    pub fn ctor(
        &mut self,
        oracle: Address,
        outcomes: Vec<(FixedBytes<8>, U256)>,
    ) -> Result<(), Vec<u8>> {
        assert_or!(self.factory.get().is_zero(), Error::AlreadyConstructed);

        let fusdc_amt = outcomes.iter().map(|(_, i)| i).sum::<U256>();

        // We assume that the Factory already supplied the liquidity to us.

        self.invested.set(u256_to_fixed(fusdc_amt, FUSDC_DECIMALS)?);

        let outcomes_len: i64 = outcomes.len().try_into().unwrap();

        assert_or!(outcomes_len == 2, Error::TwoOutcomesOnly);

        self.shares.set(I96F32::from(outcomes_len) * I96F32::from(100));

        // Start to go through each outcome, and seed it with its initial amount. And
        // set each slot in the storage with the outcome id for Longtail later.
        for (outcome_id, outcome_amt) in outcomes {
            assert_or!(!outcome_amt.is_zero(), Error::OddsMustBeSet);
            let outcome_amt = u256_to_fixed(outcome_amt, FUSDC_DECIMALS)?;
            let mut outcome = self.outcomes.setter(outcome_id);
            outcome.invested.set(outcome_amt * I96F32::from(100));
            outcome.shares.set(I96F32::from(1));

            self.outcome_list.push(outcome_id);
        }

        self.factory.set(msg::sender());
        self.oracle.set(oracle);
        Ok(())
    }

    fn internal_mint(
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
        let n_2 = self.shares.get();
        let m_2 = self.invested.get();

        // Convert everything to floats!
        let m = u256_to_fixed(value, FUSDC_DECIMALS)?;

        // Set the global states.
        self.outcomes.setter(outcome_id).invested.set(m_1 + m);
        self.invested.set(self.invested.get() + m);

        let shares = maths::shares(m_1, m_2, n_1, n_2, m)?;

        // Set the global states as the output of shares.
        self.outcomes.setter(outcome_id).shares.set(n_1 + shares);
        self.shares.set(self.shares.get() + shares);

        // Get the address of the share, then mint some in line with the
        // shares we made to the user's address!

        let share_addr = proxy::get_share_addr(FACTORY_ADDR, contract::address(), outcome_id);

        let shares = fixed_to_u256(shares, SHARE_DECIMALS)?;

        // This can happen where someone supplies too much at first. FIXME

        assert_or!(shares > U256::ZERO, Error::UnusualAmountCreated);

        share_call::mint(share_addr, recipient, shares)?;

        Ok(shares)
    }

    pub fn mint(
        &mut self,
        outcome: FixedBytes<8>,
        value: U256,
        recipient: Address,
    ) -> Result<U256, Error> {
        fusdc_call::take_from_sender(value)?;
        self.internal_mint(outcome, value, recipient)
    }

    #[allow(clippy::too_many_arguments)]
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
        self.internal_mint(outcome, value, recipient)
    }

    pub fn decide(&mut self, outcome: FixedBytes<8>) -> Result<(), Error> {
        assert_or!(msg::sender() == self.oracle.get(), Error::NotOracle);
        assert_or!(!self.decided.get(), Error::NotTradingContract);
        // Notify Longtail to pause trading on every outcome pool.
        factory_call::disable_shares(
            self.factory.get(),
            &(0..self.outcome_list.len())
                .map(|i| self.outcome_list.get(i).unwrap())
                .collect::<Vec<_>>(),
        )?;
        // Set the outcome that's winning as the winner!
        self.outcomes.setter(outcome).winner.set(true);
        self.decided.set(true);
        Ok(())
    }

    pub fn payoff(&mut self, outcome_id: FixedBytes<8>, recipient: Address) -> Result<U256, Error> {
        let outcome = self.outcomes.getter(outcome_id);
        assert_or!(outcome.winner.get(), Error::NotWinner);
        // Get the user's balance of the share they own for this outcome.
        let share_addr = proxy::get_share_addr(FACTORY_ADDR, contract::address(), outcome_id);
        // Start to burn their share of the supply to convert to a payoff amount.
        let share_bal = share_call::balance_of(share_addr, msg::sender())?;
        share_call::burn(share_addr, msg::sender(), share_bal)?;
        let n = u256_to_fixed(share_bal, SHARE_DECIMALS)?;
        let n_1 = outcome.shares.get();
        #[allow(non_snake_case)]
        let M = self.invested.get();
        let p = maths::payoff(n, n_1, M)?;
        // Send the user some fUSDC now!
        let fusdc = fixed_to_u256(p, FUSDC_DECIMALS)?;
        fusdc_call::transfer(recipient, fusdc)?;
        Ok(fusdc)
    }

    pub fn details(&self, outcome_id: FixedBytes<8>) -> Result<(U256, U256, bool), Error> {
        let outcome = self.outcomes.getter(outcome_id);
        Ok((
            fixed_to_u256(outcome.shares.get(), SHARE_DECIMALS)?,
            fixed_to_u256(outcome.invested.get(), FUSDC_DECIMALS)?,
            outcome.winner.get(),
        ))
    }

    pub fn invested(&self) -> Result<U256, Error> {
        fixed_to_u256(self.invested.get(), FUSDC_DECIMALS)
    }

    pub fn share_addr(&self, outcome: FixedBytes<8>) -> Result<Address, Error> {
        Ok(proxy::get_share_addr(
            FACTORY_ADDR,
            contract::address(),
            outcome,
        ))
    }
}

#[cfg(all(feature = "testing", not(target_arch = "wasm32")))]
impl crate::host::StorageNew for Trading {
    fn new(i: U256, v: u8) -> Self {
        unsafe { <Self as stylus_sdk::storage::StorageType>::new(i, v) }
    }
}
