use stylus_sdk::{alloy_primitives::Address, prelude::*, storage::*};

#[storage]
#[cfg_attr(any(feature = "contract-factory-1", feature = "contract-factory-2"), entrypoint)]
pub struct StorageFactory {
    pub version: StorageU8,
    pub enabled: StorageBool,

    /// Infrastructure market address.
    pub infra_market: StorageAddress,

    /// Implementation of ERC20 for the Shares that we give out
    pub share_impl: StorageAddress,

    pub dpm_extras_impl: StorageAddress,
    pub dpm_mint_impl: StorageAddress,

    // Trading contracts mapped to the creators that were created by this Factory
    pub trading_contracts: StorageMap<Address, StorageAddress>,

}
