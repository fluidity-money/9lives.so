#![cfg_attr(target_arch = "wasm32", no_main, no_std)]

extern crate lib9lives;

#[cfg(all(target_arch = "wasm32", feature = "harness-stylus-interpreter"))]
use lib9lives::alloc::format;

#[cfg(target_arch = "wasm32")]
pub use lib9lives::user_entrypoint;

#[cfg(not(target_arch = "wasm32"))]
#[doc(hidden)]
fn main() {}
