use stylus_sdk::{prelude::*, contract, alloy_primitives::*, evm, msg};

use rust_decimal::Decimal;

use crate::error::Error;

use crate::{
    decimal::{decimal_to_u256, u256_to_decimal},
    factory_call,
    immutables::*,
    proxy,
    events,
    share_call,
    fusdc_call,
    maths,
    trading_storage::StorageTrading
};

#[storage]
#[cfg_attr(feature = "trading-extras", entrypoint)]
pub struct Entrypoint {
    // Due to storage collision, this hack is possible. This shares the same
    // slot as trading_mint_contract's entrypoint.
    s: StorageTrading
}

#[cfg_attr(feature = "trading-extras", public)]
impl Entrypoint {
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
        assert_or!(self.s.factory.get().is_zero(), Error::AlreadyConstructed);

        let fusdc_amt = outcomes.iter().map(|(_, i)| i).sum::<U256>();

        // We assume that the Factory already supplied the liquidity to us.

        self.s.invested
            .set(u256_to_decimal(fusdc_amt, FUSDC_DECIMALS)?);

        let outcomes_len: i64 = outcomes.len().try_into().unwrap();

        assert_or!(outcomes_len == 2, Error::TwoOutcomesOnly);

        self.s.shares
            .set(Decimal::from(outcomes_len) * Decimal::from(100));

        // Start to go through each outcome, and seed it with its initial amount. And
        // set each slot in the storage with the outcome id for Longtail later.
        for (outcome_id, outcome_amt) in outcomes {
            assert_or!(!outcome_amt.is_zero(), Error::OddsMustBeSet);
            let outcome_amt = u256_to_decimal(outcome_amt, FUSDC_DECIMALS)?;
            let mut outcome = self.s.outcomes.setter(outcome_id);
            outcome.invested.set(outcome_amt * Decimal::from(100));
            outcome.shares.set(Decimal::from(1));

            self.s.outcome_list.push(outcome_id);
        }

        self.s.factory.set(msg::sender());
        self.s.oracle.set(oracle);
        Ok(())
    }

    pub fn decide(&mut self, outcome: FixedBytes<8>) -> Result<(), Error> {
        let oracle_addr = self.s.oracle.get();
        assert_or!(msg::sender() == oracle_addr, Error::NotOracle);
        assert_or!(!self.s.decided.get(), Error::NotTradingContract);
        // Notify Longtail to pause trading on every outcome pool.
        factory_call::disable_shares(
            self.s.factory.get(),
            &(0..self.s.outcome_list.len())
                .map(|i| self.s.outcome_list.get(i).unwrap())
                .collect::<Vec<_>>(),
        )?;
        // Set the outcome that's winning as the winner!
        self.s.outcomes.setter(outcome).winner.set(true);
        self.s.decided.set(true);
        evm::log(events::OutcomeDecided {
            identifier: outcome,
            oracle: oracle_addr,
        });
        Ok(())
    }

    pub fn payoff(&mut self, outcome_id: FixedBytes<8>, recipient: Address) -> Result<U256, Error> {
        let outcome = self.s.outcomes.getter(outcome_id);
        assert_or!(outcome.winner.get(), Error::NotWinner);
        // Get the user's balance of the share they own for this outcome.
        let share_addr = proxy::get_share_addr(FACTORY_ADDR, contract::address(), outcome_id);
        // Start to burn their share of the supply to convert to a payoff amount.
        let share_bal = share_call::balance_of(share_addr, msg::sender())?;
        share_call::burn(share_addr, msg::sender(), share_bal)?;
        let n = u256_to_decimal(share_bal, SHARE_DECIMALS)?;
        let n_1 = outcome.shares.get();
        #[allow(non_snake_case)]
        let M = self.s.invested.get();
        let p = maths::payoff(n, n_1, M)?;
        // Send the user some fUSDC now!
        let fusdc = decimal_to_u256(p, FUSDC_DECIMALS)?;
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

    pub fn details(&self, outcome_id: FixedBytes<8>) -> Result<(U256, U256, bool), Error> {
        let outcome = self.s.outcomes.getter(outcome_id);
        Ok((
            decimal_to_u256(outcome.shares.get(), SHARE_DECIMALS)?,
            decimal_to_u256(outcome.invested.get(), FUSDC_DECIMALS)?,
            outcome.winner.get(),
        ))
    }

    pub fn invested(&self) -> Result<U256, Error> {
        decimal_to_u256(self.s.invested.get(), FUSDC_DECIMALS)
    }

    pub fn share_addr(&self, outcome: FixedBytes<8>) -> Result<Address, Error> {
        Ok(proxy::get_share_addr(
            FACTORY_ADDR,
            contract::address(),
            outcome,
        ))
    }
}

