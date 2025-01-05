#![no_main]
#![no_std]

#[cfg(target_arch = "wasm32")]
pub use libtestcontract::user_entrypoint;

#[cfg(not(target_arch = "wasm32"))]
#[doc(hidden)]
fn main() {}
