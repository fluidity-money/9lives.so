use stylus_sdk::{alloy_primitives::*, evm};

use crate::{
    error::*,
    events, fusdc_call,
    immutables::*,
    utils::{contract_address, msg_sender},
};

use alloc::vec::Vec;

pub use crate::storage_factory::*;

use bobcat_features::BOBCAT_FEATURES;

BOBCAT_FEATURES!(shortterm_amm);

#[cfg_attr(feature = "contract-factory-2", stylus_sdk::prelude::public)]
impl StorageFactory {
    #[allow(clippy::too_many_arguments)]
    #[mutants::skip]
    pub fn ctor(&mut self, operator_addr: Address) -> R<()> {
        assert_or!(self.version.get().is_zero(), Error::AlreadyConstructed);
        self.enabled.set(true);
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

    pub fn disable_shares(&self, _: Vec<FixedBytes<8>>) {}
}
