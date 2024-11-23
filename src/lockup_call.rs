#[cfg(target_arch = "wasm32")]
pub use crate::wasm_lockup_call::*;

#[cfg(not(target_arch = "wasm32"))]
pub use crate::host_lockup_call::*;
