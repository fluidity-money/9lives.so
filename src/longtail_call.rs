
#[cfg(target_arch = "wasm32")]
pub use crate::wasm_longtail_call::*;

#[cfg(not(target_arch = "wasm32"))]
pub use crate::host_longtail_call::*;
