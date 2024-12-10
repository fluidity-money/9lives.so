#![coverage(off)]

use stylus_sdk::{alloy_primitives::*, storage::*};

#[cfg_attr(
    any(feature = "contract-beauty-contest", feature = "testing"),
    stylus_sdk::prelude::storage
)]
#[cfg_attr(
    any(feature = "contract-beauty-contest",),
    stylus_sdk::prelude::entrypoint
)]
pub struct StorageBeautyContest {}
