use stylus_sdk::{
    alloy_primitives::{Address, FixedBytes, U256},
    deploy::RawDeploy,
};

use crate::immutables::{erc20_proxy_code, trading_proxy_code};

fn pad_seed(seed: FixedBytes<8>) -> FixedBytes<32> {
    let mut b = [0_u8; 32];
    b[12..].copy_from_slice(seed.as_slice());
    FixedBytes::from_slice(&b)
}

// Deploy a new ERC20 using CREATE2 and the seed given. Returns the
// address.
pub fn deploy_erc20(seed: FixedBytes<8>) -> Result<Address, Vec<u8>> {
    let d = RawDeploy::new().salt(pad_seed(seed));
    let c = erc20_proxy_code();
    unsafe { d.deploy(&c, U256::ZERO) }
}

// Deploy a new Trading contract using CREATE2 and the seed given. Returns the
// address.
pub fn deploy_trading(seed: FixedBytes<8>) -> Result<Address, Vec<u8>> {
    let d = RawDeploy::new().salt(pad_seed(seed));
    let c = trading_proxy_code();
    unsafe { d.deploy(&c, U256::ZERO) }
}
