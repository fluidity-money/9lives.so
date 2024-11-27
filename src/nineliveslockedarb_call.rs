
pub use crate::share_call::burn;
pub use crate::share_call::mint;

#[cfg(target_arch = "wasm32")]
pub use crate::wasm_nineliveslockedarb_call::*;

#[cfg(not(target_arch = "wasm32"))]
pub use crate::host_nineliveslockedarb_call::*;
