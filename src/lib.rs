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
pub mod longtail_cd;
pub mod share_cd;

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

#[cfg(not(target_arch = "wasm32"))]
mod host_longtail_call;
#[cfg(target_arch = "wasm32")]
mod wasm_longtail_call;

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

pub mod contract_factory_1;
pub mod contract_factory_2;

pub mod trading_storage;

pub mod contract_trading_extras;
pub mod contract_trading_mint;

#[cfg(feature = "contract-factory-1")]
pub use contract_factory_1::user_entrypoint;

#[cfg(feature = "contract-factory-2")]
pub use contract_factory_2::user_entrypoint;

#[cfg(feature = "contract-trading-mint")]
pub use contract_trading_mint::user_entrypoint;

#[cfg(feature = "contract-trading-extras")]
pub use contract_trading_extras::user_entrypoint;

#[cfg(feature = "contract-lockup")]
pub use contract_lockup::user_entrypoint;

#[cfg(all(
    target_arch = "wasm32",
    not(any(
        feature = "contract-factory-1",
        feature = "contract-factory-2",
        feature = "contract-trading-mint",
        feature = "contract-trading-extras",
        feature = "contract-lockup",
        feature = "contract-oracle"
    )))
)]
compile_error!(
    "contract-factory-1, contract-factory-2, contract-trading-mint, contract-trading-extras, contract-lockup, or contract-oracle feature must be enabled."
);
