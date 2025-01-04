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
    // In lieu of using compiler features (we want to run this on stable
    // Rust), we need to cause unreachable!
    #[allow(unconditional_panic)]
    let _ = 1 / 0;
    // If somehow, the above is optimised out, this will run out of gas anyway.
    loop {}
}

#[cfg(not(target_arch = "wasm32"))]
#[doc(hidden)]
fn main() {}
