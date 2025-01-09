use crate::error::*;

#[cfg(feature = "e2e-adjust-time")]
use crate::utils::{test_block_timestamp_add_time, test_block_timestamp_sub_time};

pub use crate::storage_infra_market::*;

#[cfg_attr(feature = "contract-infra-market-testing", stylus_sdk::prelude::public)]
impl StorageInfraMarket {
    pub fn add_time(&mut self, _t: u64) -> R<()> {
        #[cfg(feature = "e2e-adjust-time")]
        test_block_timestamp_add_time(_t);
        #[cfg(not(feature = "e2e-adjust-time"))]
        unreachable!();
        #[allow(unreachable_code)]
        Ok(())
    }

    pub fn sub_time(&mut self, _t: u64) -> R<()> {
        #[cfg(feature = "e2e-adjust-time")]
        test_block_timestamp_sub_time(_t);
        #[cfg(not(feature = "e2e-adjust-time"))]
        unreachable!();
        #[allow(unreachable_code)]
        Ok(())
    }
}
