use stylus_sdk::{alloy_primitives::*, evm};

use crate::{
    error::*,
    events, fusdc_call,
    immutables::*,
    utils::{contract_address, msg_sender},
};

#[cfg(feature = "contract-factory-2")]
use alloc::vec::Vec;

pub use crate::storage_factory::*;

use array_concat::concat_arrays;

use stylus_sdk::call::RawCall;

#[cfg_attr(feature = "contract-factory-2", stylus_sdk::prelude::public)]
impl StorageFactory {
    #[allow(clippy::too_many_arguments)]
    #[mutants::skip]
    pub fn ctor(
        &mut self,
        oracle_addr: Address,
        operator_addr: Address,
    ) -> R<()> {
        assert_or!(self.version.get().is_zero(), Error::AlreadyConstructed);
        self.enabled.set(true);
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

    // The following methods are deprecated methods from the previous
    // proxy pattern. These will be removed eventually!

    // The quotes address for some proxies to use. Needed for backwards
    // compatibility with deployments before the 15th of October 2025,
    // the time of which we shifted to a new Huff proxy.
    pub fn quotes_addr(&self, is_dppm: bool) -> Address {
        let x: [u8; 32 + 4] = concat_arrays!([0x63, 0x61, 0x29, 0xf8], [0u8; 31], [is_dppm as u8]);
        let w = unsafe { RawCall::new().call(TRADING_BEACON_ADDR, &x) }.unwrap();
        Address::from(&w[32 - 20..].try_into().unwrap())
    }

    // The price address for some proxies to use. Needed for backwards compatibility.
    pub fn price_addr(&self, is_dppm: bool) -> Address {
        let x: [u8; 4 + 32] = concat_arrays!([0x8c, 0x6a, 0x96, 0x38], [0u8; 31], [is_dppm as u8]);
        let w = unsafe { RawCall::new().call(TRADING_BEACON_ADDR, &x) }.unwrap();
        Address::from(&w[32 - 20..].try_into().unwrap())
    }

    // The mint address for some proxies to use. Needed for backwards compatibility.
    pub fn mint_addr(&self, is_dppm: bool) -> Address {
        let x: [u8; 32 + 4] = concat_arrays!([0x92, 0x08, 0x6b, 0x25], [0u8; 31], [is_dppm as u8]);
        let w = unsafe { RawCall::new().call(TRADING_BEACON_ADDR, &x) }.unwrap();
        Address::from(&w[32 - 20..].try_into().unwrap())
    }

    // The extras address for some proxies to use. Needed for backwards compatibility.
    pub fn extras_addr(&self, is_dppm: bool) -> Address {
        let x: [u8; 4 + 32] = concat_arrays!([0x74, 0x8e, 0x94, 0x30], [0u8; 31], [is_dppm as u8]);
        let w = unsafe { RawCall::new().call(TRADING_BEACON_ADDR, &x) }.unwrap();
        Address::from(&w[32 - 20..].try_into().unwrap())
    }

    // The AMM implementation address.
    pub fn amm_impl(&self, x: FixedBytes<4>) -> Address {
        let b: [u8; 32 + 4] = concat_arrays!([0x6b, 0x8e, 0x8d, 0x96], *x, [0u8; 32 - 4]);
        let w = unsafe { RawCall::new().call(TRADING_BEACON_ADDR, &b) }.unwrap();
        Address::from(&w[32 - 20..].try_into().unwrap())
    }

    // The DPPM implementation address.
    pub fn dppm_impl(&self, x: FixedBytes<4>) -> Address {
        let b: [u8; 32 + 4] = concat_arrays!([0x6f, 0x73, 0xcb, 0xd8], *x, [0u8; 32 - 4]);
        let w = unsafe { RawCall::new().call(TRADING_BEACON_ADDR, &b) }.unwrap();
        Address::from(&w[32 - 20..].try_into().unwrap())
    }
}
