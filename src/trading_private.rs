use stylus_sdk::{alloy_primitives::*, evm};

use crate::{
    error::*,
    events,
    storage_trading::*,
    utils::{block_timestamp, msg_sender},
};

#[cfg(feature = "trading-backend-dpm")]
use {alloc::vec::Vec, crate::factory_call};

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
}
