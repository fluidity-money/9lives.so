use stylus_sdk::{
    alloy_primitives::{*},
    contract, msg,
};

use crate::{
    error::*,
    immutables::*,
    longtail_call, proxy,
};

pub use crate::factory_storage::*;

#[cfg_attr(feature = "factory-2", stylus_sdk::prelude::public)]
impl StorageFactory {
    pub fn ctor(&mut self, oracle_addr: Address) -> Result<(), Vec<u8>> {
        assert_or!(self.version.get().is_zero(), Error::AlreadyConstructed);
        self.enabled.set(true);
        self.oracle.set(oracle_addr);
        self.version.set(U8::from(1));
        Ok(())
    }

    pub fn trading_hash(&self) -> Result<FixedBytes<32>, Error> {
        Ok(FixedBytes::from_slice(&trading_proxy_hash()))
    }

    pub fn get_owner(&self, trading_addr: Address) -> Result<Address, Error> {
        Ok(self.trading_contracts.getter(trading_addr).get())
    }

    /// Disable shares from being traded via Longtail.
    pub fn disable_shares(&self, outcomes: Vec<FixedBytes<8>>) -> Result<(), Error> {
        assert_or!(
            self.trading_contracts.getter(msg::sender()).get() != Address::default(),
            Error::NotTradingContract
        );
        // Start to derive the outcomes that were given to find the share addresses.
        for outcome_id in outcomes {
            longtail_call::pause_pool(proxy::get_share_addr(
                contract::address(),
                msg::sender(),
                outcome_id,
            ))?;
        }
        Ok(())
    }
}