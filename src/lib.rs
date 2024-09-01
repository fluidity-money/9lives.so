
pub mod maths;

#[macro_use]
pub mod error;

pub mod events;

mod longtail;
mod proxy;
mod share;
mod immutables;
mod fusdc;

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
pub use factory::user_entrypoint;

#[cfg(feature = "factory")]
mod factory;

#[cfg(feature = "trading")]
mod trading;

#[cfg(feature = "trading")]
pub use trading::user_entrypoint;
