use stylus_sdk::{prelude::*, storage::*};

#[storage]
#[cfg_attr(feature = "contract-amm", entrypoint)]
pub struct StorageAMM {
    pub created: StorageBool,

    pub enabled: StorageBool,

    pub liquidity: StorageU256,

    pub outcomes: Storage
}
