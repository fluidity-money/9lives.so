pub mod decimal;
pub mod maths;

#[macro_use]
pub mod error;

pub mod events;

pub mod immutables;

#[cfg(not(target_arch = "wasm32"))]
mod host_proxy;
pub mod proxy;
#[cfg(target_arch = "wasm32")]
mod wasm_proxy;

pub mod calldata;

pub mod erc20_cd;
pub mod factory_cd;
pub mod longtail_cd;
pub mod share_cd;
pub mod trading_cd;

#[cfg(not(target_arch = "wasm32"))]
mod host_trading_call;
pub mod trading_call;
#[cfg(target_arch = "wasm32")]
mod wasm_trading_call;

#[cfg(not(target_arch = "wasm32"))]
mod host_share_call;
pub mod share_call;
#[cfg(target_arch = "wasm32")]
mod wasm_share_call;

pub mod erc20_call;

#[cfg(not(target_arch = "wasm32"))]
mod host_erc20_call;
#[cfg(target_arch = "wasm32")]
mod wasm_erc20_call;

pub mod fusdc_call;

#[cfg(all(feature = "amm-use-longtail", not(target_arch = "wasm32")))]
mod host_longtail_call;
#[cfg(all(feature = "amm-use-longtail", target_arch = "wasm32"))]
mod wasm_longtail_call;

#[cfg(all(feature = "amm-use-camelot", not(target_arch = "wasm32")))]
mod host_camelot_call;
#[cfg(all(feature = "amm-use-camelot", target_arch = "wasm32"))]
mod wasm_camelot_call;

pub mod amm_call;

pub mod factory_call;
#[cfg(not(target_arch = "wasm32"))]
mod host_factory_call;
#[cfg(target_arch = "wasm32")]
mod wasm_factory_call;

#[cfg(all(feature = "testing", not(target_arch = "wasm32")))]
pub mod host;

extern crate alloc;

pub mod factory_storage;

pub mod factory_1_contract;
pub mod factory_2_contract;

pub mod trading_storage;

pub mod trading_extras_contract;
pub mod trading_mint_contract;

#[cfg(feature = "factory-1")]
pub use factory_1_contract::user_entrypoint;

#[cfg(feature = "factory-2")]
pub use factory_2_contract::user_entrypoint;

#[cfg(feature = "trading-mint")]
pub use trading_mint_contract::user_entrypoint;

#[cfg(feature = "trading-extras")]
pub use trading_extras_contract::user_entrypoint;

#[cfg(not(any(
    feature = "amm-use-longtail",
    feature = "amm-use-camelot",
)))]
compile_error!(
    "amm-use-longtail or amm-use-camelot feature must be enabled."
);

#[cfg(all(
    feature = "amm-use-longtail",
    feature = "amm-use-camelot",
))]
compile_error!(
    "amm-use-longtail or amm-use-camelot feature cannot both be enabled."
);

#[cfg(all(
    target_arch = "wasm32",
    not(any(
        feature = "factory-1",
        feature = "factory-2",
        feature = "trading-mint",
        feature = "trading-extras",
    )))
)]
compile_error!(
    "factory-1, factory-2, trading-mint, or trading-extras feature must be enabled."
);
