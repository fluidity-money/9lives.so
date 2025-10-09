use stylus_sdk::{alloy_primitives::*, evm};

use crate::{
    error::*,
    events, fusdc_call,
    immutables::*,
    utils::{contract_address, msg_sender},
};

pub use crate::storage_factory::*;

#[cfg_attr(feature = "contract-factory-2", stylus_sdk::prelude::public)]
impl StorageFactory {
    #[allow(clippy::too_many_arguments)]
    #[mutants::skip]
    pub fn ctor(
        &mut self,
        share_impl: Address,
        trading_dppm_extras_impl: Address,
        trading_dppm_mint_impl: Address,
        trading_dppm_quotes_impl: Address,
        trading_dppm_price_impl: Address,
        trading_amm_extras_impl: Address,
        trading_amm_mint_impl: Address,
        trading_amm_quotes_impl: Address,
        trading_amm_price_impl: Address,
        oracle_addr: Address,
        operator_addr: Address,
    ) -> R<()> {
        assert_or!(self.version.get().is_zero(), Error::AlreadyConstructed);
        self.enabled.set(true);
        self.share_impl.set(share_impl);
        self.trading_dppm_extras_impl.set(trading_dppm_extras_impl);
        self.trading_dppm_mint_impl.set(trading_dppm_mint_impl);
        self.trading_dppm_quotes_impl.set(trading_dppm_quotes_impl);
        self.trading_dppm_price_impl.set(trading_dppm_price_impl);
        self.trading_amm_extras_impl.set(trading_amm_extras_impl);
        self.trading_amm_mint_impl.set(trading_amm_mint_impl);
        self.trading_amm_quotes_impl.set(trading_amm_quotes_impl);
        self.trading_amm_price_impl.set(trading_amm_price_impl);
        self.infra_market.set(oracle_addr);
        self.version.set(U8::from(1));
        self.operator.set(operator_addr);
        Ok(())
    }

    pub fn operator(&self) -> R<Address> {
        Ok(self.operator.get())
    }

    pub fn is_moderation_fee_enabled(&self) -> R<bool> {
        Ok(self.should_take_mod_fee.get())
    }

    pub fn dppm_trading_hash(&self) -> R<FixedBytes<32>> {
        Ok(FixedBytes::from_slice(&trading_proxy_hash(
            contract_address(),
            true,
        )))
    }

    pub fn amm_trading_hash(&self) -> R<FixedBytes<32>> {
        Ok(FixedBytes::from_slice(&trading_proxy_hash(
            contract_address(),
            false,
        )))
    }

    pub fn trading_hashes(&self) -> R<(FixedBytes<32>, FixedBytes<32>)> {
        Ok((c!(self.dppm_trading_hash()), c!(self.amm_trading_hash())))
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
        let addr = self.trading_addresses.get(id);
        assert_or!(!addr.is_zero(), Error::TradingAddrNonExistent);
        Ok(addr)
    }

    pub fn dao_addr(&self) -> R<Address> {
        Ok(DAO_OP_ADDR)
    }

    pub fn update_infra_market(&mut self, addr: Address) -> R<()> {
        assert_or!(msg_sender() == self.operator.get(), Error::NotOperator);
        evm::log(events::InfraMarketUpdated {
            old: self.infra_market.get(),
            new_: addr,
        });
        self.infra_market.set(addr);
        Ok(())
    }

    pub fn infra_market(&self) -> R<Address> {
        Ok(self.infra_market.get())
    }

    pub fn drain_dao_claimable(&mut self, recipient: Address) -> R<U256> {
        assert_or!(msg_sender() == self.operator.get(), Error::NotOperator);
        let amt = self.dao_claimable.get();
        fusdc_call::transfer(recipient, amt)?;
        self.dao_claimable.set(U256::ZERO);
        evm::log(events::ClaimedDAOFunds {
            recipient,
            amount: amt,
        });
        Ok(amt)
    }

    #[mutants::skip]
    pub fn upgrade_dppm_contracts(
        &mut self,
        extras: Address,
        mint: Address,
        quotes: Address,
        price: Address,
    ) -> R<()> {
        assert_or!(self.operator.get() == msg_sender(), Error::NotOperator);
        if !extras.is_zero() {
            self.trading_dppm_extras_impl.set(extras);
        }
        if !mint.is_zero() {
            self.trading_dppm_mint_impl.set(mint);
        }
        if !quotes.is_zero() {
            self.trading_dppm_quotes_impl.set(quotes);
        }
        if !price.is_zero() {
            self.trading_dppm_price_impl.set(price);
        }
        Ok(())
    }

    #[mutants::skip]
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

    pub fn mint_addr(&self, is_dppm: bool) -> Address {
        if is_dppm {
            self.trading_dppm_mint_impl.get()
        } else {
            self.trading_amm_mint_impl.get()
        }
    }

    pub fn quotes_addr(&self, is_dppm: bool) -> Address {
        if is_dppm {
            self.trading_dppm_quotes_impl.get()
        } else {
            self.trading_amm_quotes_impl.get()
        }
    }

    pub fn price_addr(&self, is_dppm: bool) -> Address {
        if is_dppm {
            self.trading_dppm_price_impl.get()
        } else {
            self.trading_amm_price_impl.get()
        }
    }

    pub fn extras_addr(&self, is_dppm: bool) -> Address {
        if is_dppm {
            self.trading_dppm_extras_impl.get()
        } else {
            self.trading_amm_extras_impl.get()
        }
    }
}
