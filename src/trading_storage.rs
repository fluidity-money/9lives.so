use stylus_sdk:: {storage::*, prelude::*, alloy_primitives::*};

use crate::decimal::StorageDecimal;

#[storage]
pub struct Outcome {
    // Outstanding invested into this outcome.
    pub invested: StorageDecimal,

    // Amount of shares in existence in this outcome.
    pub shares: StorageDecimal,

    // Was this outcome the correct outcome?
    pub winner: StorageBool,
}

#[storage]
pub struct StorageTrading {
    // Outcome was determined! It should be impossible to mint, only to burn.
    pub locked: StorageBool,

    // Oracle responsible for determine the outcome.
    pub oracle: StorageAddress,

    // Factory that created this trading pool. Empty if not created!
    pub factory: StorageAddress,

    // Shares existing in every outcome.
    pub shares: StorageDecimal,

    // Global amount invested to this pool of the native asset.
    pub invested: StorageDecimal,

    pub outcomes: StorageMap<FixedBytes<8>, Outcome>,

    // Outcomes tracked to be disabled with Longtail once a winner is found.
    pub outcome_list: StorageVec<StorageFixedBytes<8>>,

    // Has the outcome here been determined using the determine function?
    pub decided: StorageBool,
}
