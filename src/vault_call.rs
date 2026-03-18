#[cfg(target_arch = "wasm32")]
pub use crate::wasm_vault_call::*;

#[cfg(not(target_arch = "wasm32"))]
pub use crate::host_vault_call::*;
