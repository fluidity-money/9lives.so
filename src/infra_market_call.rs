#[cfg(not(target_arch = "wasm32"))]
pub use crate::host_infra_market_call::*;
#[cfg(target_arch = "wasm32")]
pub use crate::wasm_infra_market_call::*;
