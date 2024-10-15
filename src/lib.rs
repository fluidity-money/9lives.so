
pub mod maths;
pub mod decimal;

#[macro_use]
pub mod error;

pub mod events;

pub mod immutables;

#[cfg(target_arch = "wasm32")]
mod wasm_proxy;
#[cfg(not(target_arch = "wasm32"))]
mod host_proxy;
pub mod proxy;

pub mod calldata;

pub mod share_cd;
pub mod trading_cd;
pub mod erc20_cd;
pub mod longtail_cd;
pub mod factory_cd;

#[cfg(target_arch = "wasm32")]
mod wasm_trading_call;
#[cfg(not(target_arch = "wasm32"))]
mod host_trading_call;
pub mod trading_call;

#[cfg(target_arch = "wasm32")]
mod wasm_share_call;
#[cfg(not(target_arch = "wasm32"))]
mod host_share_call;
pub mod share_call;

#[cfg(target_arch = "wasm32")]
mod wasm_erc20_call;
#[cfg(not(target_arch = "wasm32"))]
mod host_erc20_call;
pub mod erc20_call;

pub mod fusdc_call;

#[cfg(target_arch = "wasm32")]
mod wasm_longtail_call;
#[cfg(not(target_arch = "wasm32"))]
mod host_longtail_call;
pub mod longtail_call;

#[cfg(target_arch = "wasm32")]
mod wasm_factory_call;
#[cfg(not(target_arch = "wasm32"))]
mod host_factory_call;
pub mod factory_call;

#[cfg(all(feature = "testing", not(target_arch = "wasm32")))]
pub mod host;

extern crate alloc;

pub mod factory_contract;
pub mod trading_contract;

#[cfg(feature = "factory")]
pub use factory_contract::user_entrypoint;

#[cfg(feature = "trading")]
pub use trading_contract::user_entrypoint;
