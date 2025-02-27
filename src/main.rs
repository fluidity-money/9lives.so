#![cfg_attr(target_arch = "wasm32", no_main, no_std)]

#[cfg(all(target_arch = "wasm32", feature = "harness-stylus-interpreter"))]
use lib9lives::alloc::format;

#[cfg(target_arch = "wasm32")]
pub use lib9lives::user_entrypoint;

#[cfg(all(feature = "harness-stylus-interpreter", target_arch = "wasm32"))]
#[mutants::skip]
#[panic_handler]
fn panic(info: &core::panic::PanicInfo) -> ! {
    let msg = format!("{}", info);
    unsafe { lib9lives::die(msg.as_ptr(), msg.len(), 1) }
    loop {}
}

#[cfg(all(not(feature = "harness-stylus-interpreter"), target_arch = "wasm32"))]
#[mutants::skip]
#[panic_handler]
fn panic(_: &core::panic::PanicInfo) -> ! {
    core::arch::wasm32::unreachable()
}

#[cfg(not(target_arch = "wasm32"))]
#[doc(hidden)]
fn main() {}
