#![cfg_attr(target_arch = "wasm32", no_std, no_main)]

#[macro_use]
pub mod error;

#[cfg(all(feature = "testing", not(target_arch = "wasm32")))]
pub use error::panic_guard;

pub mod maths;

pub mod events;

pub mod fees;
pub mod immutables;

pub mod timing_infra_market;
pub use timing_infra_market::InfraMarketState;

pub mod outcome;

#[cfg(not(target_arch = "wasm32"))]
pub mod host_proxy;

pub mod proxy;
pub mod wasm_proxy;

pub mod calldata;

pub mod testing_addrs;

pub mod utils;

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

#[cfg(not(target_arch = "wasm32"))]
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

mod trading_amm;
mod trading_dppm;
mod trading_private;

pub mod contract_trading;
pub mod contract_trading_extras;
pub mod contract_trading_mint;
pub mod contract_trading_price;
pub mod contract_trading_quotes;
pub mod storage_trading;

pub mod contract_lockup;
pub mod storage_lockup;

pub mod contract_infra_market;
pub mod contract_infra_market_testing;
pub mod storage_infra_market;

pub mod contract_beauty_contest;
pub mod storage_beauty_contest;

pub mod contract_trading_dumper;

pub mod contract_trading_extras_admin;

#[cfg(not(target_arch = "wasm32"))]
pub mod actions;

pub use storage_factory::StorageFactory;

#[cfg(feature = "contract-factory-1")]
pub use contract_factory_1::user_entrypoint;

#[cfg(feature = "contract-factory-2")]
pub use contract_factory_2::user_entrypoint;

// The following imports should all bring in user_entrypoint if the flag is enabled:
pub use contract_beauty_contest::*;
pub use contract_infra_market::*;
pub use contract_lockup::*;
pub use contract_trading::*;

#[cfg(feature = "contract-infra-market-testing")]
pub use contract_infra_market_testing::user_entrypoint;

#[cfg(all(target_arch = "wasm32", feature = "harness-stylus-interpreter"))]
#[link(wasm_import_module = "stylus_interpreter")]
extern "C" {
    #[allow(dead_code)]
    // It's easier to do this than to go through the work of a custom panic handler.
    pub fn die(ptr: *const u8, len: usize, rc: i32);
}

#[cfg(all(target_arch = "wasm32", feature = "harness-stylus-interpreter"))]
#[link(wasm_import_module = "console")]
extern "C" {
    #[allow(dead_code)]
    pub fn log_txt(ptr: *const u8, len: usize);
}

/// A useful function that uses stylus-interpreter's harness functions to
/// print a message, then die with a exit of 1.
#[macro_export]
macro_rules! harness_die {
    ($($arg:tt)+) => {{
        let msg = alloc::format!($($arg)+);
        unsafe { $crate::die(msg.as_ptr(), msg.len(), 1) }
    }};
}

#[macro_export]
macro_rules! harness_dbg {
    ($val:expr) => {{
        let tmp = $val;
        let msg = alloc::format!("[{}:{}] {} = {:#?}\n", file!(), line!(), stringify!($val), &tmp);
        unsafe { $crate::log_txt(msg.as_ptr(), msg.len()) };
        tmp
    }};
    ($($vals:expr),+ $(,)?) => {{
        let tup = ($($vals),+);
        let msg = alloc::format!("[{}:{}] {} = {:#?}\n", file!(), line!(), stringify!(($($vals),+)), &tup);
        unsafe { $crate::log_txt(msg.as_ptr(), msg.len()) };
        tup
    }};
}

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
        feature = "contract-beauty-contest",
        feature = "contract-infra-market-testing",
        feature = "contract-trading-dumper",
        // These are only enabled under special circumstances, and aren't
        // included in the default scaffolding.
        feature = "contract-trading-extras-admin"
    ))
))]
compile_error!("one of the contract-* features must be enabled!");

#[cfg(all(not(target_arch = "wasm32"), not(feature = "testing")))]
compile_error!("testing must be enabled if in not wasm32-unknown-unknown");
