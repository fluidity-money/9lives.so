use stylus_sdk::{
    alloy_primitives::{Address, FixedBytes, U256},
    deploy::RawDeploy,
};

use alloc::vec::Vec;

use crate::immutables::{boring_proxy_code, trading_proxy_code};

// Deploy a new ERC20 using CREATE2 and the seed given. Returns the
// address.
#[cfg(not(feature = "harness-stylus-interpreter"))]
pub fn deploy_erc20(erc20_impl: Address, seed: FixedBytes<32>) -> Result<Address, Vec<u8>> {
    let d = RawDeploy::new().salt(seed);
    let c = boring_proxy_code(erc20_impl);
    unsafe { d.deploy(&c, U256::ZERO) }
}

// Our harness lacks a create2 feature, so this does the work without the salt.
#[cfg(feature = "harness-stylus-interpreter")]
pub fn deploy_erc20(erc20_impl: Address, _eed: FixedBytes<32>) -> Result<Address, Vec<u8>> {
    let d = RawDeploy::new();
    let c = boring_proxy_code(erc20_impl);
    unsafe { d.deploy(&c, U256::ZERO) }
}

// Deploy a simple proxy without any extra fluff using the boring proxy
// deployment (using CREATE1).
pub fn deploy_proxy(impl_addr: Address) -> Result<Address, Vec<u8>> {
    let d = RawDeploy::new();
    let c = boring_proxy_code(impl_addr);
    unsafe { d.deploy(&c, U256::ZERO) }
}

// Deploy a new Trading contract using CREATE2 and the seed given.
// Returns the address.
#[cfg(not(feature = "harness-stylus-interpreter"))]
pub fn deploy_trading(
    factory_addr: Address,
    is_dpm: bool,
    seed: FixedBytes<32>,
) -> Result<Address, Vec<u8>> {
    let d = RawDeploy::new().salt(seed);
    let c = trading_proxy_code(factory_addr, is_dpm);
    unsafe { d.deploy(&c, U256::ZERO) }
}

#[cfg(feature = "harness-stylus-interpreter")]
pub fn deploy_trading(
    factory: Address,
    is_dpm: bool,
    _seed: FixedBytes<32>,
) -> Result<Address, Vec<u8>> {
    let d = RawDeploy::new();
    let c = trading_proxy_code(factory, is_dpm);
    unsafe { d.deploy(&c, U256::ZERO) }
}
