use stylus_sdk::{alloy_primitives::*, storage::*, prelude::*};

#[storage]
#[cfg_attr(feature = "contract-lockup", entrypoint)]
pub struct StorageLockup {
    /// Was this contract created successfully?
    pub created: StorageBool,

    /// Is the contract enabled? Did an emergency take place?
    pub enabled: StorageBool,

    /// Deployed infrastructure market address.
    pub infra_market_addr: StorageAddress,

    /// 9lives Locked ARB token that we're controlling.
    pub token_addr: StorageAddress,

    /// Global amount of liquidity locked up by everyone.
    pub liquidity: StorageU256,

    /// Amount of locked ARB supplied by this address.
    // address => arb
    pub locked_arb_user: StorageMap<Address, StorageU256>,

    /// The timestamp that the block timestamp must pass for a locker to withdraw
    /// their funds.
    pub deadlines: StorageMap<Address, StorageU64>
}
