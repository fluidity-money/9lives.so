use stylus_sdk::{alloy_primitives::*, evm};

use crate::{
    error::*,
    maths,
    fees::FEE_SCALING,
    events,
    storage_trading::*,
    utils::{block_timestamp, msg_sender},
};

#[cfg(feature = "trading-backend-dpm")]
use {crate::factory_call, alloc::vec::Vec};

impl StorageTrading {
    pub fn internal_shutdown(&mut self) -> R<U256> {
        // Notify Longtail to pause trading on every outcome pool.
        assert_or!(!self.is_shutdown.get(), Error::IsShutdown);
        // We only do the shutdown if the backend is the DPM!
        #[cfg(feature = "trading-backend-dpm")]
        factory_call::disable_shares(
            self.factory_addr.get(),
            &self.outcome_ids_iter().collect::<Vec<_>>(),
        )?;
        self.is_shutdown.set(true);
        Ok(U256::ZERO)
    }

    pub fn require_not_done_predicting(&self) -> R<()> {
        assert_or!(
            self.when_decided.get().is_zero()
                && !self.is_shutdown.get()
                && self.time_ending.get() > U64::from(block_timestamp()),
            Error::DoneVoting
        );
        Ok(())
    }

    pub fn internal_decide(&mut self, outcome: FixedBytes<8>) -> R<U256> {
        let oracle_addr = self.oracle.get();
        assert_or!(msg_sender() == oracle_addr, Error::NotOracle);
        assert_or!(self.when_decided.get().is_zero(), Error::NotTradingContract);
        // Set the outcome that's winning as the winner!
        self.winner.set(outcome);
        self.when_decided.set(U64::from(block_timestamp()));
        evm::log(events::OutcomeDecided {
            identifier: outcome,
            oracle: oracle_addr,
        });
        // We call shutdown in the event this wasn't called in the past.
        if !self.is_shutdown.get() {
            self.internal_shutdown()?;
        }
        Ok(U256::ZERO)
    }

    /// Calculate and set fees where possible, including the AMM fee weight
    /// if we're a AMM. Returns the amount remaining.
    pub fn calculate_and_set_fees(&mut self, value: U256, referrer: Address) -> R<U256> {
        let fee_for_creator = maths::mul_div_round_up(value, self.fee_creator.get(), FEE_SCALING)?;
        let fee_for_lp = maths::mul_div_round_up(value, self.fee_lp.get(), FEE_SCALING)?;
        let fee_for_referrer = if !referrer.is_zero() {
            maths::mul_div_round_up(value, self.fee_referrer.get(), FEE_SCALING)?
        } else {
            U256::ZERO
        };
        let fee_cum = fee_for_creator + fee_for_lp + fee_for_referrer;
        // Start to allocate some fees to the creator and to the referrer.
        if !fee_for_creator.is_zero() {
            let fees_so_far = self.fees_owed_addresses.get(self.fee_recipient.get());
            self.fees_owed_addresses.setter(self.fee_recipient.get()).set(
                fees_so_far
                    .checked_add(fee_for_creator)
                    .ok_or(Error::CheckedAddOverflow)?,
            );
        }
        if !fee_for_referrer.is_zero() {
            let fees_so_far = self.fees_owed_addresses.get(referrer);
            self.fees_owed_addresses.setter(referrer).set(
                fees_so_far
                    .checked_add(fee_for_referrer)
                    .ok_or(Error::CheckedAddOverflow)?,
            );
        }
        #[cfg(feature = "trading-backend-amm")]
        self.amm_fee_weight.set(
            self.amm_fee_weight
                .get()
                .checked_add(fee_cum)
                .ok_or(Error::CheckedAddOverflow)?,
        );
        // It will never be the case that the fee exceeds the amount here, but
        // this good programming regardless to check.
        let value = value
            .checked_sub(fee_cum)
            .ok_or(Error::CheckedSubOverflow)?;
        Ok(value)
    }
}
