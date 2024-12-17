#![cfg_attr(target_arch = "wasm32", no_std, no_main)]

#[macro_use]
pub mod error;

pub mod decimal;
pub mod maths;

pub mod events;

pub mod fees;
pub mod immutables;

pub mod timing_infra_market;

#[cfg(not(target_arch = "wasm32"))]
mod host_proxy;
pub mod proxy;
#[cfg(target_arch = "wasm32")]
mod wasm_proxy;

pub mod calldata;

mod testing_addrs;

pub mod utils;

pub mod erc20_cd;
pub mod longtail_cd;

pub mod host_trading_call;
pub mod trading_call;
pub mod wasm_trading_call;

pub mod host_share_call;
pub mod share_call;
pub mod wasm_share_call;

pub mod erc20_call;
pub mod host_erc20_call;
pub mod wasm_erc20_call;

pub mod fusdc_call;

pub mod amm_call;
pub mod host_longtail_call;
pub mod wasm_longtail_call;

pub mod factory_call;
pub mod host_factory_call;
pub mod wasm_factory_call;

pub mod host_lockup_call;
pub mod lockup_call;
pub mod wasm_lockup_call;

pub mod host_nineliveslockedarb_call;
pub mod nineliveslockedarb_call;
pub mod wasm_nineliveslockedarb_call;

pub mod host_infra_market_call;
pub mod infra_market_call;
pub mod wasm_infra_market_call;

#[cfg(all(feature = "testing", not(target_arch = "wasm32")))]
pub mod host;

pub extern crate alloc;

pub mod contract_factory_1;
pub mod contract_factory_2;
pub mod storage_factory;

pub mod contract_trading;
pub mod contract_trading_extras;
pub mod contract_trading_mint;
pub mod contract_trading_price;
pub mod contract_trading_quotes;
pub mod storage_trading;

pub mod contract_lockup;
pub mod storage_lockup;

pub mod contract_infra_market;
pub mod storage_infra_market;

pub mod contract_beauty_contest;
pub mod storage_beauty_contest;

pub use storage_factory::StorageFactory;

#[cfg(feature = "contract-factory-1")]
pub use contract_factory_1::user_entrypoint;

#[cfg(feature = "contract-factory-2")]
pub use contract_factory_2::user_entrypoint;

// The following imports should all bring in user_entrypoint if the flag is enabled:
pub use contract_trading::*;
pub use contract_lockup::*;
pub use contract_infra_market::*;
pub use contract_beauty_contest::*;

#[cfg(all(
    target_arch = "wasm32",
    not(any(
        feature = "contract-factory-1",
        feature = "contract-factory-2",
        feature = "contract-trading-extras",
        feature = "contract-trading-mint",
        feature = "contract-trading-quotes",
        feature = "contract-trading-price",
        feature = "contract-lockup",
        feature = "contract-infra-market",
        feature = "contract-beauty-contest"
    ))
))]
compile_error!("one of the contract-* features must be enabled!");
