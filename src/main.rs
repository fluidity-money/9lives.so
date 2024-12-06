#![cfg_attr(target_arch = "wasm32", no_main, no_std)]
#![allow(internal_features)]
#![feature(core_intrinsics)]

#[cfg(all(target_arch = "wasm32", feature = "harness-stylus-interpreter"))]
use lib9lives::alloc::format;

#[cfg(target_arch = "wasm32")]
pub use lib9lives::user_entrypoint;

#[cfg(all(target_arch = "wasm32", feature = "harness-stylus-interpreter"))]
#[link(wasm_import_module = "stylus_interpreter")]
extern "C" {
    #[allow(dead_code)]
    fn die(ptr: *const u8, len: usize, rc: i32);
}

#[cfg(all(feature = "harness-stylus-interpreter", target_arch = "wasm32"))]
#[panic_handler]
fn panic(info: &core::panic::PanicInfo) -> ! {
    let msg = format!("{}", info);
    unsafe { die(msg.as_ptr(), msg.len(), 1) }
    loop {}
}

#[cfg(all(not(feature = "harness-stylus-interpreter"), target_arch = "wasm32"))]
#[panic_handler]
fn panic(_: &core::panic::PanicInfo) -> ! {
    // I haven't found a way to do the aborting here without using
    // the std.
    core::intrinsics::abort();
}

#[cfg(not(target_arch = "wasm32"))]
#[doc(hidden)]
fn main() {}
