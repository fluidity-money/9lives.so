use stylus_sdk::{alloy_primitives::*, storage::*, prelude::*};

#[storage]
#[cfg_attr(feature = "contract-lockup", entrypoint)]
pub struct StorageLockup {
    /// Was this contract created successfully?
    pub(crate) created: StorageBool,

    /// Is the contract enabled? Did an emergency take place?
    pub(crate) enabled: StorageBool,

    /// Deployed infrastructure market address.
    pub(crate) infra_market_addr: StorageAddress,

    /// 9lives Locked ARB token that we're controlling.
    pub(crate) token_addr: StorageAddress,

    /// The timestamp that the block timestamp must pass for a locker to withdraw
    /// their funds.
    pub(crate) deadlines: StorageMap<Address, StorageU64>
}
