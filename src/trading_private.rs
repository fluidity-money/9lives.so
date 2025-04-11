use stylus_sdk::alloy_primitives::*;

use crate::{error::*, factory_call, storage_trading::*, utils::block_timestamp};

use alloc::vec::Vec;

impl StorageTrading {
    pub fn internal_shutdown(&mut self) -> R<U256> {
        // Notify Longtail to pause trading on every outcome pool.
        assert_or!(!self.is_shutdown.get(), Error::IsShutdown);
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
}
