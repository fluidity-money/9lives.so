use stylus_sdk::{
    alloy_primitives::{Address, FixedBytes, U256},
    deploy::RawDeploy,
};

use alloc::vec::Vec;

use crate::immutables::{boring_proxy_code, trading_amm_proxy, trading_dppm_proxy};

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
pub fn deploy_trading(
    beacon_addr: Address,
    is_dppm: bool,
    seed: FixedBytes<32>,
) -> Result<Address, Vec<u8>> {
    let d = RawDeploy::new().salt(seed);
    let c = if is_dppm {
        trading_dppm_proxy(beacon_addr)
    } else {
        trading_amm_proxy(beacon_addr)
    };
    unsafe { d.deploy(&c, U256::ZERO) }
}
