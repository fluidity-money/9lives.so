use stylus_sdk::{prelude::*, storage::*};

#[storage]
#[cfg_attr(feature = "contract-amm", entrypoint)]
pub struct StorageAMM {
    /// Was this contract created?
    pub created: StorageBool,

    /// Is this contract in a state of emergency (locked down?)
    pub enabled: StorageBool,

    /// Global amount of liquidity that's invested in this contract.
    pub liquidity: StorageU256,

    /// Shares vested in specific outcomes.
    // trading => shares
    pub shares: StorageMap<FixedBytes<8>, StorageU256>,
}
