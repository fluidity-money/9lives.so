use stylus_sdk::{alloy_primitives::*, block, contract, evm, msg};

use rust_decimal::Decimal;

use crate::error::Error;

use crate::{
    decimal::{
        fusdc_decimal_to_u256, fusdc_u256_to_decimal, share_decimal_to_u256, share_u256_to_decimal,
    },
    events, factory_call, fusdc_call,
    immutables::*,
    maths, proxy, share_call,
    storage_trading_dpm::StorageTradingDPM,
};

#[cfg(feature = "contract-trading-extras")]
pub use crate::storage_trading_dpm::user_entrypoint;

#[cfg_attr(feature = "contract-trading-extras", stylus_sdk::prelude::public)]
impl StorageTradingDPM {
    // Seeds the pool with the first outcome. Assumes msg.sender is
    // the factory. Seeder is the address to take the money from. It
    // should have the approval done beforehand with its own
    // estimation of the address based on the CREATE2 process.
    // Does not prevent a user from submitting the same outcome twice!
    pub fn ctor(
        &mut self,
        outcomes: Vec<(FixedBytes<8>, U256)>,
        oracle: Address,
        time_start: u64,
        time_ending: u64,
        fee_recipient: Address
    ) -> Result<(), Vec<u8>> {
        // We check that the caller is the factory, and if they are, we allow them
        // to call us willy-nilly. Factory could harm us by calling this function again,
        // but with the current implementation, that's not the case, allowing us to
        // save on gas.
        assert_or!(msg::sender() == FACTORY_ADDR, Error::CallerIsNotFactory);
        let fusdc_amt = outcomes.iter().map(|(_, i)| i).sum::<U256>();
        // We assume that the Factory already supplied the liquidity to us.
        self.global_invested.set(fusdc_amt);
        let outcomes_len: i64 = outcomes.len().try_into().unwrap();
        assert_or!(outcomes_len == 2, Error::TwoOutcomesOnly);
        self.global_shares.set(Decimal::from(outcomes_len));
        // Start to go through each outcome, and seed it with its initial amount. And
        // set each slot in the storage with the outcome id for Longtail later.
        for (outcome_id, outcome_amt) in outcomes {
            assert_or!(!outcome_amt.is_zero(), Error::OddsMustBeSet);
            self.outcome_invested.setter(outcome_id).set(outcome_amt);
            self.outcome_shares.setter(outcome_id).set(Decimal::from(1));
            self.outcome_list.push(outcome_id);
        }
        self.share_impl.set(factory_call::share_impl(FACTORY_ADDR)?);
        self.fee_recipient.set(fee_recipient);
        self.time_start.set(U64::from(time_start));
        self.time_ending.set(U64::from(time_ending));
        self.oracle.set(oracle);
        Ok(())
    }

    pub fn shutdown(&mut self) -> Result<U256, Error> {
        // Notify Longtail to pause trading on every outcome pool.
        // TODO, send a "thank you" amount to the caller of this function
        // when it's called for the first time.
        assert_or!(self.is_shutdown.get(), Error::IsShutdown);
        factory_call::disable_shares(
            FACTORY_ADDR,
            &(0..self.outcome_list.len())
                .map(|i| self.outcome_list.get(i).unwrap())
                .collect::<Vec<_>>(),
        )?;
        self.is_shutdown.set(true);
        Ok(U256::ZERO)
    }

    pub fn decide(&mut self, outcome: FixedBytes<8>) -> Result<(), Error> {
        let oracle_addr = self.oracle.get();
        assert_or!(msg::sender() == oracle_addr, Error::NotOracle);
        assert_or!(self.when_decided.get().is_zero(), Error::NotTradingContract);
        // Set the outcome that's winning as the winner!
        self.winner.set(outcome);
        self.when_decided.set(U64::from(block::timestamp()));
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
        assert_or!(self.winner.get() == outcome_id, Error::NotWinner);
        // Get the user's balance of the share they own for this outcome.
        let share_addr = proxy::get_share_addr(
            FACTORY_ADDR,
            contract::address(), // Address of this contract, the Trading contract.
            self.share_impl.get(),
            outcome_id,
        );
        // Start to burn their share of the supply to convert to a payoff amount.
        // Take the max of what they asked.
        let share_bal = U256::min(share_call::balance_of(share_addr, msg::sender())?, amt);
        assert_or!(share_bal > U256::ZERO, Error::ZeroShares);
        share_call::burn(share_addr, msg::sender(), share_bal)?;
        let n = share_u256_to_decimal(share_bal)?;
        let n_1 = self.outcome_shares.get(outcome_id);
        #[allow(non_snake_case)]
        let M = fusdc_u256_to_decimal(self.global_invested.get())?;
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

    pub fn details(&self, outcome_id: FixedBytes<8>) -> Result<(U256, U256, U256, FixedBytes<8>), Error> {
        Ok((
            share_decimal_to_u256(self.outcome_shares.get(outcome_id))?,
            self.outcome_invested.get(outcome_id),
            self.global_invested.get(),
            self.winner.get(),
        ))
    }

    pub fn ended(&self) -> Result<bool, Error> {
        Ok(!self.when_decided.is_zero())
    }

    pub fn invested(&self) -> Result<U256, Error> {
        Ok(self.global_invested.get())
    }

    pub fn share_addr(&self, outcome: FixedBytes<8>) -> Result<Address, Error> {
        Ok(proxy::get_share_addr(
            FACTORY_ADDR,
            contract::address(),
            self.share_impl.get(),
            outcome,
        ))
    }
}
