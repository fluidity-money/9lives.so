use stylus_sdk::{alloy_primitives::*, contract};

use alloc::vec::Vec;

use crate::{amm_call, error::*, immutables::*, proxy};

pub use crate::{storage_factory::*, utils::msg_sender};

#[cfg_attr(feature = "contract-factory-2", stylus_sdk::prelude::public)]
impl StorageFactory {
    pub fn ctor(
        &mut self,
        share_impl: Address,
        trading_dpm_extras_impl: Address,
        trading_dpm_mint_impl: Address,
        trading_dpm_quotes_impl: Address,
        trading_dpm_price_impl: Address,
        trading_amm_extras_impl: Address,
        trading_amm_mint_impl: Address,
        trading_amm_quotes_impl: Address,
        trading_amm_price_impl: Address,
        oracle_addr: Address,
    ) -> R<()> {
        assert_or!(self.version.get().is_zero(), Error::AlreadyConstructed);
        self.enabled.set(true);
        self.share_impl.set(share_impl);
        self.trading_dpm_extras_impl.set(trading_dpm_extras_impl);
        self.trading_dpm_mint_impl.set(trading_dpm_mint_impl);
        self.trading_dpm_quotes_impl.set(trading_dpm_quotes_impl);
        self.trading_dpm_price_impl.set(trading_dpm_price_impl);
        self.trading_amm_extras_impl.set(trading_amm_extras_impl);
        self.trading_amm_mint_impl.set(trading_amm_mint_impl);
        self.trading_amm_quotes_impl.set(trading_amm_quotes_impl);
        self.trading_amm_price_impl.set(trading_amm_price_impl);
        self.infra_market.set(oracle_addr);
        self.version.set(U8::from(1));
        Ok(())
    }

    pub fn dpm_trading_hash(&self) -> R<FixedBytes<32>> {
        Ok(FixedBytes::from_slice(&trading_proxy_hash(
            self.trading_dpm_extras_impl.get(),
            self.trading_dpm_mint_impl.get(),
            self.trading_dpm_quotes_impl.get(),
            self.trading_dpm_price_impl.get(),
        )))
    }

    pub fn amm_trading_hash(&self) -> R<FixedBytes<32>> {
        Ok(FixedBytes::from_slice(&trading_proxy_hash(
            self.trading_amm_extras_impl.get(),
            self.trading_amm_mint_impl.get(),
            self.trading_amm_quotes_impl.get(),
            self.trading_amm_price_impl.get(),
        )))
    }

    pub fn trading_hashes(&self) -> R<(FixedBytes<32>, FixedBytes<32>)> {
        Ok((c!(self.dpm_trading_hash()), c!(self.amm_trading_hash())))
    }

    pub fn erc20_hash(&self) -> R<FixedBytes<32>> {
        Ok(FixedBytes::from_slice(&erc20_proxy_hash(
            self.share_impl.get(),
        )))
    }

    pub fn share_impl(&self) -> R<Address> {
        Ok(self.share_impl.get())
    }

    pub fn fusdc_addr(&self) -> R<Address> {
        Ok(FUSDC_ADDR)
    }

    pub fn get_owner(&self, trading_addr: Address) -> R<Address> {
        Ok(self.trading_owners.getter(trading_addr).get())
    }

    pub fn get_backend(&self, trading_addr: Address) -> R<u8> {
        Ok(u8::from_be_bytes(
            self.trading_backends
                .getter(trading_addr)
                .get()
                .to_be_bytes(),
        ))
    }

    pub fn get_trading_addr(&self, id: FixedBytes<32>) -> R<Address> {
        Ok(self.trading_addresses.get(id))
    }

    pub fn upgrade_dpm_contracts(
        &mut self,
        extras: Address,
        mint: Address,
        quotes: Address,
        price: Address,
    ) -> R<()> {
        assert_or!(self.operator.get() == msg_sender(), Error::NotOperator);
        if !extras.is_zero() {
            self.trading_dpm_extras_impl.set(extras);
        }
        if !mint.is_zero() {
            self.trading_dpm_mint_impl.set(mint);
        }
        if !quotes.is_zero() {
            self.trading_dpm_quotes_impl.set(quotes);
        }
        if !price.is_zero() {
            self.trading_dpm_price_impl.set(price);
        }
        Ok(())
    }

    pub fn upgrade_amm_contracts(
        &mut self,
        extras: Address,
        mint: Address,
        quotes: Address,
        price: Address,
    ) -> R<()> {
        assert_or!(self.operator.get() == msg_sender(), Error::NotOperator);
        if !extras.is_zero() {
            self.trading_amm_extras_impl.set(extras);
        }
        if !mint.is_zero() {
            self.trading_amm_mint_impl.set(mint);
        }
        if !quotes.is_zero() {
            self.trading_amm_quotes_impl.set(quotes);
        }
        if !price.is_zero() {
            self.trading_amm_price_impl.set(price);
        }
        Ok(())
    }

    /// Disable shares from being traded via Longtail.
    pub fn disable_shares(&self, outcomes: Vec<FixedBytes<8>>) -> R<()> {
        // Check if the caller is a trading contract by checking the map
        // of created contracts. This check should be safe since the trading
        // backend enum is only ever 1 or 2.
        assert_or!(
            !self.trading_backends.get(msg_sender()).is_zero(),
            Error::NotTradingContract
        );
        // Start to derive the outcomes that were given to find the share addresses.
        // It should be safe to do this as we rederive the share address every time.
        for outcome_id in outcomes {
            c!(amm_call::pause_pool(proxy::get_share_addr(
                contract::address(),   // Factory address.
                msg_sender(),          // Trading address (this is the caller).
                self.share_impl.get(), // The share address.
                outcome_id,            // The outcome that should be banned from continuing.
            )));
        }
        Ok(())
    }
}
