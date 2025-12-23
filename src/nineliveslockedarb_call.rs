#[allow(deprecated)]
pub use crate::{
    erc20_call::{balance_of, transfer},
    share_call::{burn, mint},
};

#[cfg(target_arch = "wasm32")]
pub use crate::wasm_nineliveslockedarb_call::*;

#[cfg(not(target_arch = "wasm32"))]
pub use crate::host_nineliveslockedarb_call::*;
