use stylus_sdk::{alloy_primitives::*, contract, msg};

use crate::{amm_call, error::*, immutables::*, proxy};

pub use crate::storage_factory::*;

#[cfg_attr(feature = "contract-factory-2", stylus_sdk::prelude::public)]
impl StorageFactory {
    pub fn ctor(
        &mut self,
        share_impl: Address,
        trading_dpm_extras_impl: Address,
        trading_dpm_mint_impl: Address,
        trading_amm_extras_impl: Address,
        trading_amm_mint_impl: Address,
        oracle_addr: Address,
    ) -> R<()> {
        assert_or!(self.version.get().is_zero(), Error::AlreadyConstructed);
        self.enabled.set(true);
        self.share_impl.set(share_impl);
        self.trading_dpm_extras_impl.set(trading_dpm_extras_impl);
        self.trading_dpm_mint_impl.set(trading_dpm_mint_impl);
        self.trading_amm_extras_impl.set(trading_amm_extras_impl);
        self.trading_amm_mint_impl.set(trading_amm_mint_impl);
        self.infra_market.set(oracle_addr);
        self.version.set(U8::from(1));
        ok(())
    }

    pub fn dpm_trading_hash(&self) -> R<FixedBytes<32>> {
        ok(FixedBytes::from_slice(&trading_proxy_hash(
            self.trading_dpm_extras_impl.get(),
            self.trading_dpm_mint_impl.get(),
        )))
    }

    pub fn amm_trading_hash(&self) -> R<FixedBytes<32>> {
        ok(FixedBytes::from_slice(&trading_proxy_hash(
            self.trading_amm_extras_impl.get(),
            self.trading_amm_mint_impl.get(),
        )))
    }

    pub fn trading_hashes(&self) -> R<(FixedBytes<32>, FixedBytes<32>)> {
        ok((self.dpm_trading_hash()?, self.amm_trading_hash()?))
    }

    pub fn erc20_hash(&self) -> R<FixedBytes<32>> {
        ok(FixedBytes::from_slice(&erc20_proxy_hash(
            self.share_impl.get(),
        )))
    }

    pub fn erc20_impl(&self) -> R<Address> {
        ok(self.share_impl.get())
    }

    pub fn fusdc_addr(&self) -> R<Address> {
        ok(FUSDC_ADDR)
    }

    pub fn get_owner(&self, trading_addr: Address) -> R<Address> {
        ok(self.trading_contracts.getter(trading_addr).get())
    }

    /// Disable shares from being traded via Longtail.
    pub fn disable_shares(&self, outcomes: Vec<FixedBytes<8>>) -> R<()> {
        assert_or!(
            self.trading_contracts.getter(msg::sender()).get() != Address::default(),
            Error::NotTradingContract
        );
        // Start to derive the outcomes that were given to find the share addresses.
        for outcome_id in outcomes {
            amm_call::pause_pool(proxy::get_share_addr(
                contract::address(),   // Factory address.
                msg::sender(),         // Trading address (this is the caller).
                self.share_impl.get(), // The share address.
                outcome_id,            // The outcome that should be banned from continuing.
            ))?;
        }
        ok(())
    }
}
