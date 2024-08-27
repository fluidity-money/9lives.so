use stylus_sdk::{
    alloy_primitives::{aliases::*, *},
    prelude::*,
    storage::*,
};

pub mod maths;

mod immutables;

use crate::immutables::*;

extern crate alloc;
#[cfg(target_arch = "wasm32")]
mod allocator {
    use lol_alloc::{AssumeSingleThreaded, FreeListAllocator};
    // SAFETY: This application is single threaded, so using AssumeSingleThreaded is allowed.
    #[global_allocator]
    static ALLOCATOR: AssumeSingleThreaded<FreeListAllocator> =
        unsafe { AssumeSingleThreaded::new(FreeListAllocator::new()) };
}

#[solidity_storage]
#[entrypoint]
pub struct Ninelives {
    // Global amount invested to this pool of the native asset.
    global_invested: StorageU256,

    // Fee taken by the owners of the derivative token, sent to the fee recipient in immutables.
    fee_derivative: StorageU8,

    // Outcome contracts that can be invested into.
    contracts: StorageMap<FixedBytes<8>, Contract>,
}

#[solidity_storage]
struct Contract {
    // Amount invested into this outcome.
    invested: StorageU256,

    // Amount of shares in existence in this outcome.
    shares: StorageU256,
}

#[external]
impl Ninelives {
    // Seeds the pool with the first outcome.
    fn ctor() -> Result<(), Vec<u8>> {
        Ok(())
    }
}
