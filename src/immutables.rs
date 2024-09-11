///! All of these immutable variables should be set with an environment
///! variable, and are in some cases (ie, the Factory), configured based on
///! nonce management. We have a preference for online keccak256,
///! but we use a constant function here to simplify CREATE2 interaction.
use stylus_sdk::alloy_primitives::{address, Address};

use array_concat::concat_arrays;

use sha3_const::Keccak256;

pub const LONGTAIL_ADDR: Address = address!("feb6034fc7df27df18a3a6bad5fb94c0d3dcb6d5");

pub const FUSDC_ADDR: Address = address!("feb6034fc7df27df18a3a6bad5fb94c0d3dcb6d5");

// Factory address, derived using the next nonce of the deployer to store in bytecode.
pub const FACTORY_ADDR: Address = address!("feb6034fc7df27df18a3a6bad5fb94c0d3dcb6d5");

pub const ERC20_IMPL_ADDR: Address = address!("feb6034fc7df27df18a3a6bad5fb94c0d3dcb6d5");
pub const ERC20_IMPL_BYTES: [u8; 20] = [
    0xfe, 0xb6, 0x03, 0x4f, 0xc7, 0xdf, 0x27, 0xdf, 0x18, 0xa3, 0xa6, 0xba, 0xd5, 0xfb, 0x94, 0xc0,
    0xd3, 0xdc, 0xb6, 0xd5,
];

pub const TRADING_IMPL_ADDR: Address = address!("0000000000000000000000000000000000000000");
pub const TRADING_IMPL_BYTES: [u8; 20] = [
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00,
];

// Minimal viable proxy bytecode.
pub const PROXY_BYTECODE: [u8; 114] = [
    0x60, 0x20, 0x80, 0x38, 0x03, 0x3d, 0x39, 0x3d, 0x51, 0x7f, 0x36, 0x08, 0x94, 0xa1, 0x3b, 0xa1,
    0xa3, 0x21, 0x06, 0x67, 0xc8, 0x28, 0x49, 0x2d, 0xb9, 0x8d, 0xca, 0x3e, 0x20, 0x76, 0xcc, 0x37,
    0x35, 0xa9, 0x20, 0xa3, 0xca, 0x50, 0x5d, 0x38, 0x2b, 0xbc, 0x55, 0x60, 0x3e, 0x80, 0x60, 0x34,
    0x3d, 0x39, 0x3d, 0xf3, 0x36, 0x3d, 0x3d, 0x37, 0x3d, 0x3d, 0x36, 0x3d, 0x7f, 0x36, 0x08, 0x94,
    0xa1, 0x3b, 0xa1, 0xa3, 0x21, 0x06, 0x67, 0xc8, 0x28, 0x49, 0x2d, 0xb9, 0x8d, 0xca, 0x3e, 0x20,
    0x76, 0xcc, 0x37, 0x35, 0xa9, 0x20, 0xa3, 0xca, 0x50, 0x5d, 0x38, 0x2b, 0xbc, 0x54, 0x5a, 0xf4,
    0x3d, 0x60, 0x00, 0x80, 0x3e, 0x61, 0x00, 0x39, 0x57, 0x3d, 0x60, 0x00, 0xfd, 0x5b, 0x3d, 0x60,
    0x00, 0xf3,
];

pub const fn erc20_proxy_code() -> [u8; 134] {
    concat_arrays!(PROXY_BYTECODE, ERC20_IMPL_BYTES)
}

pub const fn trading_proxy_code() -> [u8; 134] {
    concat_arrays!(PROXY_BYTECODE, TRADING_IMPL_BYTES)
}

pub const fn erc20_proxy_hash() -> [u8; 32] {
    Keccak256::new().update(&erc20_proxy_code()).finalize()
}

pub const fn trading_proxy_hash() -> [u8; 32] {
    Keccak256::new().update(&trading_proxy_code()).finalize()
}

pub const FUSDC_DECIMALS: u8 = 6;

pub const SHARE_DECIMALS: u8 = 18;

pub const FEE_RECIPIENT: Address = address!("0000000000000000000000000000000000000000");

pub const LONGTAIL_FEE: u32 = 3000;

pub const LONGTAIL_TICK_SPACING: u8 = 10;

pub const LONGTAIL_MAX_LIQ_PER_TICK: u128 = u128::MAX;

#[test]
#[ignore]
fn print_deployment_bytecode() {
    use const_hex::encode;
    dbg!(encode(PROXY_BYTECODE), encode(erc20_proxy_code()), encode(trading_proxy_code()));
}

#[test]
#[ignore]
fn print_proxy_hashes() {
    use const_hex::encode;
    dbg!(encode(erc20_proxy_hash()), encode(trading_proxy_hash()));
}
