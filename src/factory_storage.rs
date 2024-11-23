use stylus_sdk::{alloy_primitives::Address, prelude::*, storage::*};

#[storage]
#[cfg_attr(any(feature = "contract-factory-1", feature = "contract-factory-2"), entrypoint)]
pub struct StorageFactory {
    pub version: StorageU8,
    pub enabled: StorageBool,
    pub oracle: StorageAddress,

    // Trading contracts mapped to the creators that were created by this Factory
    pub trading_contracts: StorageMap<Address, StorageAddress>,
}
