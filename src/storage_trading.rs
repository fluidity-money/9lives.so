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
#[cfg_attr(any(feature = "contract-dpm-trading-mint", feature = "contract-dpm-trading-extras"), entrypoint)]
pub struct StorageDPM {
    /// Outcome was determined! It should be impossible to mint, only to burn.
    /// This is the timestamp the locking took place. If it's 0, then we haven't
    /// decided the outcome yet.
    pub when_decided: StorageU64,

    /// Was this contract shut down? This is called once the deadline has
    /// expired to pause trading.
    pub is_shutdown: StorageBool,

    /// The fee recipient of funds.
    pub fee_recipient: StorageAddress,

    /// When the time of trading is possible for this.
    pub time_start: StorageU64,

    /// When the time of trading has ended.
    pub time_ending: StorageU64,

    /// Oracle responsible for determine the outcome.
    pub oracle: StorageAddress,

    /// The recorded share implementation that's needed to reconstruct the
    /// location of the share contract. Stored here to prevent extra calls later
    /// during the construction of this.
    pub share_impl: StorageAddress,

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
impl crate::host::StorageNew for StorageDPM {
    fn new(i: U256, v: u8) -> Self {
        unsafe { <Self as stylus_sdk::storage::StorageType>::new(i, v) }
    }
}
