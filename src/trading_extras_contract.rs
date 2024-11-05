use stylus_sdk::{block, alloy_primitives::*, contract, evm, msg};

use rust_decimal::Decimal;

use crate::error::Error;

use crate::{
    decimal::{
        fusdc_decimal_to_u256, fusdc_u256_to_decimal, share_decimal_to_u256, share_u256_to_decimal,
    },
    events, factory_call, fusdc_call,
    immutables::*,
    maths, proxy, share_call,
    trading_storage::StorageTrading,
};

#[cfg(feature = "trading-extras")]
pub use crate::trading_storage::user_entrypoint;

#[cfg_attr(feature = "trading-extras", stylus_sdk::prelude::public)]
impl StorageTrading {
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

        self.invested.set(fusdc_u256_to_decimal(fusdc_amt)?);

        let outcomes_len: i64 = outcomes.len().try_into().unwrap();

        assert_or!(outcomes_len == 2, Error::TwoOutcomesOnly);

        self.shares.set(Decimal::from(outcomes_len));

        // Start to go through each outcome, and seed it with its initial amount. And
        // set each slot in the storage with the outcome id for Longtail later.
        for (outcome_id, outcome_amt) in outcomes {
            assert_or!(!outcome_amt.is_zero(), Error::OddsMustBeSet);
            let outcome_amt = fusdc_u256_to_decimal(outcome_amt)?;
            let mut outcome = self.outcomes.setter(outcome_id);
            outcome.invested.set(outcome_amt);
            outcome.shares.set(Decimal::from(1));

            self.outcome_list.push(outcome_id);
        }

        self.factory.set(msg::sender());
        self.oracle.set(oracle);
        Ok(())
    }

    pub fn decide(&mut self, outcome: FixedBytes<8>) -> Result<(), Error> {
        let oracle_addr = self.oracle.get();
        assert_or!(msg::sender() == oracle_addr, Error::NotOracle);
        assert_or!(self.locked.get().is_zero(), Error::NotTradingContract);
        // Notify Longtail to pause trading on every outcome pool.
        factory_call::disable_shares(
            self.factory.get(),
            &(0..self.outcome_list.len())
                .map(|i| self.outcome_list.get(i).unwrap())
                .collect::<Vec<_>>(),
        )?;
        // Set the outcome that's winning as the winner!
        self.outcomes.setter(outcome).winner.set(true);
        self.locked.set(U64::from(block::timestamp()));
        evm::log(events::OutcomeDecided {
            identifier: outcome,
            oracle: oracle_addr,
        });
        Ok(())
    }

    pub fn payoff(
        &mut self,
        outcome_id: FixedBytes<8>,
        amt: U256,
        recipient: Address,
    ) -> Result<U256, Error> {
        let outcome = self.outcomes.getter(outcome_id);
        assert_or!(outcome.winner.get(), Error::NotWinner);
        // Get the user's balance of the share they own for this outcome.
        let share_addr = proxy::get_share_addr(FACTORY_ADDR, contract::address(), outcome_id);
        // Start to burn their share of the supply to convert to a payoff amount.
        // Take the max of what they asked.
        let share_bal = U256::min(share_call::balance_of(share_addr, msg::sender())?, amt);
        assert_or!(share_bal > U256::ZERO, Error::ZeroShares);
        share_call::burn(share_addr, msg::sender(), share_bal)?;
        let n = share_u256_to_decimal(share_bal)?;
        let n_1 = outcome.shares.get();
        #[allow(non_snake_case)]
        let M = self.invested.get();
        // Get the cumulative payout for the user.
        let p = maths::payoff(n, n_1, M)?;
        // Send the user some fUSDC now!
        let fusdc = fusdc_decimal_to_u256(p)?;
        fusdc_call::transfer(recipient, fusdc)?;
        evm::log(events::PayoffActivated {
            identifier: outcome_id,
            sharesSpent: share_bal,
            spender: msg::sender(),
            recipient,
            fusdcReceived: fusdc,
        });
        Ok(fusdc)
    }

    pub fn details(&self, outcome_id: FixedBytes<8>) -> Result<(U256, U256, U256, bool), Error> {
        let outcome = self.outcomes.getter(outcome_id);
        Ok((
            share_decimal_to_u256(outcome.shares.get())?,
            fusdc_decimal_to_u256(outcome.invested.get())?,
            fusdc_decimal_to_u256(self.invested.get())?,
            outcome.winner.get(),
        ))
    }

    pub fn ended(&self) -> Result<bool, Error> {
        Ok(!self.locked.is_zero())
    }

    pub fn invested(&self) -> Result<U256, Error> {
        fusdc_decimal_to_u256(self.invested.get())
    }

    pub fn share_addr(&self, outcome: FixedBytes<8>) -> Result<Address, Error> {
        Ok(proxy::get_share_addr(
            FACTORY_ADDR,
            contract::address(),
            outcome,
        ))
    }
}
