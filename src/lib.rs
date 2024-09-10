
pub mod maths;
pub mod float;

#[macro_use]
pub mod error;

pub mod events;

pub mod immutables;
pub mod proxy;

pub mod calldata;

pub mod share_cd;
pub mod trading_cd;
pub mod erc20_cd;
pub mod longtail_cd;
pub mod factory_cd;

pub mod trading_call;
pub mod share_call;
pub mod erc20_call;
pub mod fusdc_call;
pub mod longtail_call;
pub mod factory_call;

#[cfg(all(feature = "testing", not(target_arch = "wasm32")))]
mod host;

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
