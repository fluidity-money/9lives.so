use stylus_sdk::{alloy_primitives::*, prelude::*, storage::*};

#[storage]
#[cfg_attr(feature = "contract-lockup", entrypoint)]
pub struct StorageLockup {
    /// Was this contract created successfully?
    pub created: StorageBool,

    /// Is the contract enabled? Did an emergency take place?
    pub enabled: StorageBool,

    /// Operator with the ability to freeze this contract.
    pub operator: StorageAddress,

    /// Deployed infrastructure market address.
    pub infra_market_addr: StorageAddress,

    /// 9lives Locked ARB token that we're controlling.
    pub token_addr: StorageAddress,

    /// The timestamp that the block timestamp must pass for a locker to withdraw
    /// their funds.
    pub deadlines: StorageMap<Address, StorageU64>,
}

#[cfg(not(target_arch = "wasm32"))]
impl std::fmt::Debug for StorageLockup {
    fn fmt(&self, f: &mut std::fmt::Formatter) -> Result<(), std::fmt::Error> {
        write!(
            f,
            "StorageLockup {{ {:?}, {:?}, {:?}, {:?}, .. }}",
            self.enabled, self.operator, self.infra_market_addr, self.token_addr
        )
    }
}

#[cfg(all(test, not(target_arch = "wasm32")))]
pub fn strat_storage_lockup() -> impl proptest::prelude::Strategy<Value = StorageLockup> {
    // We hope that the random storage offset protects us in the
    // test invocations so we don't need to do special setup
    // work.
    use crate::{storage_set_fields, utils::strat_large_u256};
    use proptest::prelude::*;
    (
        strat_large_u256().no_shrink(), // Storage offset
        any::<bool>(),
        any::<bool>(),
        any::<Address>(),
        any::<Address>(),
    )
        .prop_map(|(i, created, enabled, operator, token_addr)| {
            storage_set_fields!(StorageLockup, i, {
                created,
                enabled,
                operator,
                token_addr
            })
        })
}
