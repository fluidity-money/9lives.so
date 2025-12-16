// This exports user_entrypoint, which we need to have the entrypoint code.
pub use crate::{
    error::*,
    fusdc_call,
    immutables::{DAO_OP_ADDR, DAO_EARN_ADDR},
    storage_trading::*,
    trading_call,
    utils::{contract_address, msg_sender},
};

#[allow(unused)]
use alloc::vec::Vec;

#[cfg_attr(feature = "contract-trading-extras-admin", stylus_sdk::prelude::public)]
impl StorageTrading {
    // Shift drains what the team considers "junk" liquidity (a poorly made
    // market that is impossible to resolve and the owner doesn't care). It
    // should be used with an excessive amount of caution and communication.
    pub fn shift(&mut self) -> R<()> {
        #[cfg(feature = "trading-backend-dppm")]
        unimplemented!();
        #[cfg(not(feature = "trading-backend-dppm"))]
        {
            assert_or!(msg_sender() == DAO_OP_ADDR, Error::NotOperator);
            fusdc_call::transfer(DAO_EARN_ADDR, fusdc_call::balance_of(contract_address())?)?;
            if !self.is_shutdown.get() {
                self.internal_shutdown()?;
            }
            Ok(())
        }
    }
}
