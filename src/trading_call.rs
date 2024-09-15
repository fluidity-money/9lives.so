
#[cfg(target_arch = "wasm32")]
pub use crate::wasm_trading_call::*;

#[cfg(not(target_arch = "wasm32"))]
pub use crate::host_trading_call::*;
