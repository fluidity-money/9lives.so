#[cfg(target_arch = "wasm32")]
pub use crate::wasm_erc20_call::*;

#[cfg(not(target_arch = "wasm32"))]
pub use crate::host_erc20_call::*;
