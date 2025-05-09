#![cfg_attr(target_arch = "wasm32", no_main, no_std)]

#[cfg(all(target_arch = "wasm32", feature = "harness-stylus-interpreter"))]
use lib9lives::alloc::format;

#[cfg(target_arch = "wasm32")]
pub use lib9lives::user_entrypoint;

#[cfg(all(feature = "harness-stylus-interpreter", target_arch = "wasm32"))]
#[mutants::skip]
#[panic_handler]
fn panic(info: &core::panic::PanicInfo) -> ! {
    unsafe {
        backtrace::trace_unsynchronized(|frame| {
            let ip = frame.ip() as usize;
            let msg = format!("Died: {info}, frame pointer: {ip}");
            lib9lives::die(msg.as_ptr(), msg.len(), 1);
            true
        });
    }
    // This will be run if we don't compile with the trace info.
    let msg = format!("Died: {info}");
    unsafe {
        lib9lives::die(msg.as_ptr(), msg.len(), 1);
    }
    core::arch::wasm32::unreachable()
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
