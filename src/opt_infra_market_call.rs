#[cfg(target_arch = "wasm32")]
pub use crate::wasm_opt_infra_market_call::*;
#[cfg(not(target_arch = "wasm32"))]
pub use crate::host_opt_infra_market_call::*;
