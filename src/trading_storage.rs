use stylus_sdk::{alloy_primitives::*, prelude::*, storage::*};

use crate::decimal::StorageDecimal;

#[storage]
pub struct StorageOutcome {
    // Outstanding invested into this outcome.
    pub invested: StorageU256,

    // Amount of shares in existence in this outcome.
    pub shares: StorageDecimal,

    // Was this outcome the correct outcome?
    pub winner: StorageBool,
}

#[storage]
#[cfg_attr(any(feature = "contract-trading-mint", feature = "contract-trading-extras"), entrypoint)]
pub struct StorageTrading {
    /// Outcome was determined! It should be impossible to mint, only to burn.
    /// This is the timestamp the locking took place. If it's 0, then we haven't
    /// decided the outcome yet.
    pub locked: StorageU64,

    /// Oracle responsible for determine the outcome.
    pub oracle: StorageAddress,

    /// Factory that created this trading pool. Empty if not created!
    pub factory: StorageAddress,

    /// Shares existing in every outcome.
    pub shares: StorageDecimal,

    /// Global amount invested to this pool of the native asset.
    pub invested: StorageU256,

    /// Outcomes vested in the contract.
    pub outcomes: StorageMap<FixedBytes<8>, StorageOutcome>,

    /// Outcomes tracked to be disabled with Longtail once a winner is found.
    pub outcome_list: StorageVec<StorageFixedBytes<8>>,

    /// The amount paid out so far by the decided amount.
    pub amount_paid_out: StorageDecimal
}

#[cfg(all(feature = "testing", not(target_arch = "wasm32")))]
impl crate::host::StorageNew for StorageTrading {
    fn new(i: U256, v: u8) -> Self {
        unsafe { <Self as stylus_sdk::storage::StorageType>::new(i, v) }
    }
}
