use stylus_sdk::{alloy_primitives::*, storage::*};

#[cfg(feature = "testing")]
use stylus_sdk::storage::StorageType;

#[derive(Debug)]
#[repr(C)]
pub enum TradingBackendType {
    DPM = 1,
    AMM = 2,
    DPPM = 3,
}

impl From<TradingBackendType> for u8 {
    fn from(v: TradingBackendType) -> Self {
        v as u8
    }
}

#[cfg_attr(
    any(
        feature = "contract-factory-1",
        feature = "contract-factory-2",
        feature = "testing"
    ),
    stylus_sdk::prelude::storage
)]
#[cfg_attr(
    any(feature = "contract-factory-1", feature = "contract-factory-2"),
    stylus_sdk::prelude::entrypoint
)]
pub struct StorageFactory {
    /// The version of this contract after it was deployed. Useful for any
    /// migrations.
    pub version: StorageU8,

    /// The operator of this contract (able to replace the implementations).
    pub operator: StorageAddress,

    /// Is the contract currently in an enabled state (not an emergency)?
    pub enabled: StorageBool,

    /// Infrastructure market address.
    pub infra_market: StorageAddress,

    /// Implementation of ERC20 for the Shares that we give out. Not set any
    /// more.
    pub share_impl: StorageAddress,

    pub __unused_1: StorageAddress,
    pub __unused_2: StorageAddress,
    pub __unused_3: StorageAddress,
    pub __unused_4: StorageAddress,

    pub __unused_5: StorageAddress,
    pub __unused_6: StorageAddress,
    pub __unused_7: StorageAddress,
    pub __unused_8: StorageAddress,

    /// Trading contracts mapped to the creators that were created by this Factory.
    pub trading_owners: StorageMap<Address, StorageAddress>,

    /// The chosen trading contract backend for this Trading instance.
    pub trading_backends: StorageMap<Address, StorageU8>,

    /// Utility for getting trading addresses quickly based on their inputs.
    pub trading_addresses: StorageMap<FixedBytes<32>, StorageAddress>,

    /// Amounts claimable by the DAO for moderation operations.
    pub dao_claimable: StorageU256,

    /// If set to true, every creation of a fee will take a small fee.
    pub should_take_mod_fee: StorageBool,
}

#[cfg(feature = "testing")]
impl crate::host::StorageNew for StorageFactory {
    fn new(i: U256, v: u8) -> Self {
        unsafe { <Self as StorageType>::new(i, v) }
    }
}
