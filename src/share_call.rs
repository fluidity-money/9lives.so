
#[cfg(target_arch = "wasm32")]
pub use crate::wasm_share_call::*;

#[cfg(not(target_arch = "wasm32"))]
pub use crate::host_share_call::*;
