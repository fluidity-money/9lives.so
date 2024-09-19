/// All of these immutable variables should be set with an environment
/// variable, and are in some cases (ie, the Factory), configured based on
/// nonce management. We have a preference for online keccak256,
/// but we use a constant function here to simplify CREATE2 interaction.
use stylus_sdk::alloy_primitives::{address, Address, U256};

use array_concat::{concat_arrays, concat_arrays_size};

use paste::paste;

use sha3_const::Keccak256;

#[cfg(not(feature = "testing"))]
macro_rules! env_addr {
    ($name:ident, $input:literal) => {
        paste! {
            const [<$name _BYTES>]: [u8; 20] = match const_hex::const_decode_to_array::<20>(env!($input).as_bytes()) {
                Ok(res) => res,
                Err(_) => panic!(),
            };
            pub const $name: Address = Address::new([<$name _BYTES>]);
        }
    };
}

#[cfg(feature = "testing")]
macro_rules! env_addr {
    ($name:ident, $input:literal) => {
        paste! {
            #[allow(unused)]
            const [<$name _BYTES>]: [u8; 20] = [0_u8; 20];
            #[allow(unused)]
            pub const $name: Address = Address::ZERO;
        }
    };
}

// Longtail address deployed.
env_addr!(LONGTAIL_ADDR, "SPN_LONGTAIL_ADDR");

// fUSDC address to use as the base asset for everything.
env_addr!(FUSDC_ADDR, "SPN_FUSDC_ADDR");

// Factory address, derived using the next nonce of the deployer to store in bytecode.
env_addr!(FACTORY_ADDR, "SPN_FACTORY_PROXY_ADDR");

// Implementation of the ERC20 token for proxy deployment of shares.
env_addr!(ERC20_IMPL_ADDR, "SPN_ERC20_IMPL_ADDR");

// Implementation of the trading code deployment.
env_addr!(TRADING_IMPL_ADDR, "SPN_TRADING_IMPL_ADDR");

// Minimal viable proxy bytecode.
pub const PROXY_BYTECODE_1: [u8; 20] = [
    0x3d, 0x60, 0x2d, 0x80, 0x60, 0x0a, 0x3d, 0x39, 0x81, 0xf3, 0x36, 0x3d, 0x3d, 0x37, 0x3d, 0x3d,
    0x3d, 0x36, 0x3d, 0x73,
];

pub const PROXY_BYTECODE_2: [u8; 15] = [
    0x5a, 0xf4, 0x3d, 0x82, 0x80, 0x3e, 0x90, 0x3d, 0x91, 0x60, 0x2b, 0x57, 0xfd, 0x5b, 0xf3,
];

pub const fn erc20_proxy_code(
) -> [u8; concat_arrays_size!(PROXY_BYTECODE_1, ERC20_IMPL_ADDR_BYTES, PROXY_BYTECODE_2)] {
    concat_arrays!(PROXY_BYTECODE_1, ERC20_IMPL_ADDR_BYTES, PROXY_BYTECODE_2)
}

pub const fn trading_proxy_code(
) -> [u8; concat_arrays_size!(PROXY_BYTECODE_1, TRADING_IMPL_ADDR_BYTES, PROXY_BYTECODE_2)] {
    concat_arrays!(PROXY_BYTECODE_1, TRADING_IMPL_ADDR_BYTES, PROXY_BYTECODE_2)
}

pub const fn erc20_proxy_hash() -> [u8; 32] {
    Keccak256::new().update(&erc20_proxy_code()).finalize()
}

pub const fn trading_proxy_hash() -> [u8; 32] {
    Keccak256::new().update(&trading_proxy_code()).finalize()
}

// fUSDC decimals should be this low!
pub const FUSDC_DECIMALS: u8 = 6;

// Share decimals should be this low!
pub const SHARE_DECIMALS: u8 = 6;

pub const FEE_RECIPIENT: Address = address!("6221a9c005f6e47eb398fd867784cacfdcfff4e7");

pub const LONGTAIL_PRICE: U256 = U256::from_limbs([1, 0, 0, 0]);

pub const LONGTAIL_FEE: u32 = 3000;

pub const LONGTAIL_TICK_SPACING: u8 = 10;

pub const LONGTAIL_MAX_LIQ_PER_TICK: u128 = u128::MAX;

#[test]
#[ignore]
fn print_deployment_bytecode() {
    use const_hex::encode;
    dbg!(
        ERC20_IMPL_ADDR,
        TRADING_IMPL_ADDR,
        encode(PROXY_BYTECODE_1),
        encode(PROXY_BYTECODE_2),
        encode(erc20_proxy_code()),
        encode(trading_proxy_code())
    );
}

#[test]
#[ignore]
fn print_proxy_hashes() {
    use const_hex::encode;
    dbg!(encode(erc20_proxy_hash()), encode(trading_proxy_hash()));
}
