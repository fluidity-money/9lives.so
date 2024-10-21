use stylus_sdk::{prelude::*, storage::*, alloy_primitives::Address};

#[storage]
#[cfg_attr(any(feature = "factory-1", feature = "factory-2"), entrypoint)]
pub struct StorageFactory {
    pub version: StorageU8,
    pub enabled: StorageBool,
    pub oracle: StorageAddress,

    // Trading contracts mapped to the creators that were created by this Factory
    pub trading_contracts: StorageMap<Address, StorageAddress>,
}
