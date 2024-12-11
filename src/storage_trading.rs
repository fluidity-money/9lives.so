#![coverage(off)]

use stylus_sdk::{alloy_primitives::*, storage::*};

#[cfg_attr(
    any(
        feature = "contract-trading-mint",
        feature = "contract-trading-extras",
        feature = "contract-trading-quotes",
        feature = "contract-trading-price",
        feature = "testing"
    ),
    stylus_sdk::prelude::storage
)]
#[cfg_attr(
    any(
        feature = "contract-trading-mint",
        feature = "contract-trading-extras",
        feature = "contract-trading-quotes",
        feature = "contract-trading-price"
    ),
    stylus_sdk::prelude::entrypoint
)]
pub struct StorageTrading {
    /// Was this contract created?
    pub created: StorageBool,

    /// The address of the factory.
    pub factory_addr: StorageAddress,

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

    /// Shares invested in every outcome cumulatively. NOT IN USE BY THE
    /// AMM.
    pub global_shares: StorageU256,

    /// Shares invested in a specific outome.
    pub outcome_shares: StorageMap<FixedBytes<8>, StorageU256>,

    /// Amount that was invested to seed this pool. Used as liquidity by the AMM.
    pub seed_invested: StorageU256,

    /// Global amount invested to this pool of the native asset.
    pub global_invested: StorageU256,

    /// The amount invested in a specific outcome.
    pub outcome_invested: StorageMap<FixedBytes<8>, StorageU256>,

    /// Outcomes tracked to be disabled with Longtail once a winner is found.
    pub outcome_list: StorageVec<StorageFixedBytes<8>>,

    /// The outcome that was chosen to win by the oracle.
    pub winner: StorageFixedBytes<8>,

    /// The amount paid out so far by the decided amount.
    pub amount_paid_out: StorageU256,

    /// Whether the contract should extend the deadline by 3 hours if purchases are made under 3
    /// hours that pass the buffer requirement. This could be useful in a polling situation.
    pub should_buffer_time: StorageBool,
}

#[cfg(feature = "testing")]
impl crate::host::StorageNew for StorageTrading {
    fn new(i: U256, v: u8) -> Self {
        unsafe { <Self as StorageType>::new(i, v) }
    }
}
