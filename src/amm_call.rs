#[cfg(all(feature = "amm-use-longtail", target_arch = "wasm32"))]
pub use crate::wasm_longtail_call::*;

#[cfg(all(feature = "amm-use-longtail", not(target_arch = "wasm32")))]
pub use crate::host_longtail_call::*;

#[cfg(all(feature = "amm-use-camelot", target_arch = "wasm32"))]
pub use crate::wasm_camelot_call::*;

#[cfg(all(feature = "amm-use-camelot", not(target_arch = "wasm32")))]
pub use crate::host_camelot_call::*;
