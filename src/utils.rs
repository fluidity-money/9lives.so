
use stylus_sdk::alloy_primitives::Address;

pub fn block_timestamp() -> u64 {
    #[cfg(all(feature = "testing", not(target_arch = "wasm32")))]
    return crate::host::block_timestamp();
    #[cfg(target_arch = "wasm32")]
    return block::timestamp();
}

pub fn msg_sender() -> Address {
    #[cfg(all(feature = "testing", not(target_arch = "wasm32")))]
    return crate::host::get_msg_sender();
    #[cfg(target_arch = "wasm32")]
    return msg::sender();
}
