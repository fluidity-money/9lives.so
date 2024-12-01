use stylus_sdk::{
    alloy_primitives::{Address, FixedBytes},
    storage::*,
};

#[derive(Debug)]
#[repr(C)]
pub enum TradingBackendType {
    DPM = 1,
    AMM = 2,
}

impl Into<u8> for TradingBackendType {
    fn into(self) -> u8 {
        self as u8
    }
}

#[cfg_attr(
    any(feature = "contract-factory-1", feature = "contract-factory-2"),
    stylus_sdk::prelude::storage, stylus_sdk::prelude::entrypoint
)]
pub struct StorageFactory {
    pub version: StorageU8,
    pub enabled: StorageBool,

    /// Infrastructure market address.
    pub infra_market: StorageAddress,

    /// Implementation of ERC20 for the Shares that we give out
    pub share_impl: StorageAddress,

    pub trading_dpm_extras_impl: StorageAddress,
    pub trading_dpm_mint_impl: StorageAddress,
    pub trading_dpm_quotes_impl: StorageAddress,
    pub trading_dpm_price_impl: StorageAddress,

    pub trading_amm_extras_impl: StorageAddress,
    pub trading_amm_mint_impl: StorageAddress,
    pub trading_amm_quotes_impl: StorageAddress,
    pub trading_amm_price_impl: StorageAddress,

    /// Trading contracts mapped to the creators that were created by this Factory.
    pub trading_owners: StorageMap<Address, StorageAddress>,

    /// The chosen trading contract backend for this Trading instance.
    pub trading_backends: StorageMap<Address, StorageU8>,

    /// Utility for getting trading addresses quickly based on their inputs.
    pub trading_addresses: StorageMap<FixedBytes<32>, StorageAddress>,
}
