#![allow(unused)]

use stylus_sdk::block;

use crate::host;

pub fn block_timestamp() -> u64 {
    #[cfg(not(target_arch = "wasm32"))]
    return host::block_timestamp();
    #[cfg(target_arch = "wasm32")]
    return block::timestamp();
}
