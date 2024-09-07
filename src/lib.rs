pub mod maths;

#[macro_use]
pub mod error;

pub mod events;

pub mod fusdc;
pub mod immutables;
pub mod longtail;
pub mod proxy;

pub mod share_cd;
pub mod trading_cd;

extern crate alloc;
#[cfg(target_arch = "wasm32")]
mod allocator {
    use lol_alloc::{AssumeSingleThreaded, FreeListAllocator};
    // SAFETY: This application is single threaded, so using AssumeSingleThreaded is allowed.
    #[global_allocator]
    static ALLOCATOR: AssumeSingleThreaded<FreeListAllocator> =
        unsafe { AssumeSingleThreaded::new(FreeListAllocator::new()) };
}

#[cfg(feature = "factory")]
mod factory;

#[cfg(feature = "factory")]
pub use factory::user_entrypoint;

#[cfg(feature = "trading")]
mod trading;

#[cfg(feature = "trading")]
pub use trading::user_entrypoint;
