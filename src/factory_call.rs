#[cfg(target_arch = "wasm32")]
pub use crate::wasm_factory_call::*;

#[cfg(not(target_arch = "wasm32"))]
pub use crate::host_factory_call::*;
