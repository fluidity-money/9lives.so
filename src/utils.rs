#![coverage(off)]
#![doc(hidden)]

use stylus_sdk::alloy_primitives::Address;

pub fn block_timestamp() -> u64 {
    #[cfg(all(feature = "testing", not(target_arch = "wasm32")))]
    return crate::host::block_timestamp();
    #[cfg(target_arch = "wasm32")]
    return stylus_sdk::block::timestamp();
}

pub fn msg_sender() -> Address {
    #[cfg(all(feature = "testing", not(target_arch = "wasm32")))]
    return crate::host::get_msg_sender();
    #[allow(unreachable_code)]
    stylus_sdk::msg::sender()
}
