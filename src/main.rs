#![cfg_attr(target_arch = "wasm32", no_main, no_std)]

#[cfg(all(target_arch = "wasm32", feature = "harness-stylus-interpreter"))]
use lib9lives::alloc::format;

#[cfg(target_arch = "wasm32")]
pub use lib9lives::user_entrypoint;

#[cfg(all(target_arch = "wasm32", feature = "harness-stylus-interpreter"))]
#[link(wasm_import_module = "stylus_interpreter")]
extern "C" {
    #[allow(dead_code)]
    // It's easier to do this than to go through the work of a custom panic handler.
    fn die(ptr: *const u8, len: usize, rc: i32);
}

#[cfg(all(feature = "harness-stylus-interpreter", target_arch = "wasm32"))]
#[panic_handler]
fn panic(info: &core::panic::PanicInfo) -> ! {
    let msg = format!("{}", info);
    unsafe { die(msg.as_ptr(), msg.len(), 1) }
    loop {}
}

#[cfg(all(target_arch = "wasm32", feature = "harness-stylus-interpreter"))]
#[link(wasm_import_module = "stylus_interpreter")]
extern "C" {
    #[allow(dead_code)]
    // It's easier to do this than to go through the work of a custom panic handler.
    fn die(ptr: *const u8, len: usize, rc: i32);
}

#[cfg(all(not(feature = "harness-stylus-interpreter"), target_arch = "wasm32"))]
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
