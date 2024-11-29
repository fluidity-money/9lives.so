#![allow(unused)]

use stylus_sdk::block;

#[cfg(all(feature = "testing", not(target_arch = "wasm32")))]
use crate::host;

pub fn block_timestamp() -> u64 {
    #[cfg(all(feature = "testing", not(target_arch = "wasm32")))]
    return host::block_timestamp();
    #[cfg(target_arch = "wasm32")]
    return block::timestamp();
}
