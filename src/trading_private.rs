use stylus_sdk::{alloy_primitives::*, };

use crate::{
    error::*,
    factory_call,
    storage_trading::*,
};

use alloc::vec::Vec;

impl StorageTrading {
    pub fn internal_shutdown(&mut self) -> R<U256> {
        // Notify Longtail to pause trading on every outcome pool.
        assert_or!(!self.is_shutdown.get(), Error::IsShutdown);
        factory_call::disable_shares(
            self.factory_addr.get(),
            &(0..self.outcome_list.len())
                .map(|i| self.outcome_list.get(i).unwrap())
                .collect::<Vec<_>>(),
        )?;
        self.is_shutdown.set(true);
        Ok(U256::ZERO)
    }
}
