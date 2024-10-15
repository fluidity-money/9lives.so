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

// Implementation of the trading code mint functions.
env_addr!(TRADING_MINT_IMPL_ADDR, "SPN_TRADING_MINT_IMPL_ADDR");

// Implementation of the trading code payoff and extra functions.
env_addr!(TRADING_EXTRAS_IMPL_ADDR, "SPN_TRADING_EXTRAS_IMPL_ADDR");

// Minimal viable proxy bytecode.
pub const NORMAL_PROXY_BYTECODE_1: [u8; 18] = [
    0x60, 0x2d, 0x5f, 0x81, 0x60, 0x09, 0x5f, 0x39, 0xf3, 0x5f, 0x5f, 0x36, 0x5f, 0x5f, 0x37, 0x36,
    0x5f, 0x73,
];

pub const NORMAL_PROXY_BYTECODE_2: [u8; 16] = [
    0x5a, 0xf4, 0x3d, 0x5f, 0x5f, 0x3e, 0x60, 0x29, 0x57, 0x3d, 0x5f, 0xfd, 0x5b, 0x3d, 0x5f, 0xf3,
];

pub const TRADING_PROXY_BYTECODE_1: [u8; 67] = [
    0x61, 0x00, 0x9c, 0x61, 0x00, 0x0f, 0x60, 0x00, 0x39, 0x61, 0x00, 0x9c, 0x60, 0x00, 0xf3,
    0x34, 0x61, 0x00, 0x98, 0x57, 0x60, 0x01, 0x60, 0x02, 0x36, 0x11, 0x15, 0x61, 0x00, 0x98, 0x57,
    0x60, 0x01, 0x60, 0x80, 0x52, 0x60, 0x01, 0x60, 0x02, 0x60, 0xa0, 0x37, 0x60, 0x80, 0x60, 0x20,
    0x81, 0x01, 0x51, 0x81, 0x51, 0x60, 0x20, 0x03, 0x60, 0x03, 0x1b, 0x1c, 0x90, 0x50, 0x18, 0x61,
    0x00, 0x52, 0x57, 0x73,
];

pub const TRADING_PROXY_BYTECODE_2: [u8; 12] = [
    0x60, 0x40, 0x52, 0x61, 0x00, 0x72, 0x61, 0x00, 0x74, 0x56, 0x5b, 0x73,
];

pub const TRADING_PROXY_BYTECODE_3: [u8; 70] = [
    0x60, 0x40, 0x52, 0x61, 0x00, 0x72, 0x61, 0x00, 0x74, 0x56, 0x5b, 0x00, 0x5b, 0x60, 0x40, 0x51,
    0x5a, 0x59, 0x5f, 0x5f, 0x36, 0x36, 0x5f, 0x85, 0x37, 0x83, 0x86, 0x86, 0xf4, 0x90, 0x50, 0x90,
    0x50, 0x90, 0x50, 0x61, 0x00, 0x96, 0x57, 0x3d, 0x5f, 0x5f, 0x3e, 0x3d, 0x5f, 0xfd, 0x5b, 0x56,
    0x5b, 0x5f, 0x80, 0xfd, 0x84, 0x18, 0x9c, 0x80, 0x00, 0xa1, 0x65, 0x76, 0x79, 0x70, 0x65, 0x72,
    0x83, 0x00, 0x04, 0x00, 0x00, 0x12,
];

pub const fn erc20_proxy_code() -> [u8; concat_arrays_size!(
    NORMAL_PROXY_BYTECODE_1,
    ERC20_IMPL_ADDR_BYTES,
    NORMAL_PROXY_BYTECODE_2
)] {
    concat_arrays!(
        NORMAL_PROXY_BYTECODE_1,
        ERC20_IMPL_ADDR_BYTES,
        NORMAL_PROXY_BYTECODE_2
    )
}

pub const fn trading_proxy_code() -> [u8; concat_arrays_size!(
    TRADING_PROXY_BYTECODE_1,
    TRADING_MINT_IMPL_ADDR_BYTES,
    TRADING_PROXY_BYTECODE_2,
    TRADING_EXTRAS_IMPL_ADDR_BYTES,
    TRADING_PROXY_BYTECODE_3
)] {
    concat_arrays!(
        TRADING_PROXY_BYTECODE_1,
        TRADING_MINT_IMPL_ADDR_BYTES,
        TRADING_PROXY_BYTECODE_2,
        TRADING_EXTRAS_IMPL_ADDR_BYTES,
        TRADING_PROXY_BYTECODE_3
    )
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

//79228162514264337593543950336
pub const LONGTAIL_PRICE: U256 = U256::from_limbs([0, 4294967296, 0, 0]);

pub const LONGTAIL_FEE: u32 = 3000;

pub const LONGTAIL_TICK_SPACING: u8 = 10;

pub const LONGTAIL_MAX_LIQ_PER_TICK: u128 = u128::MAX;

#[test]
#[ignore]
fn print_deployment_bytecode() {
    use const_hex::encode;
    dbg!(
        encode(NORMAL_PROXY_BYTECODE_1),
        ERC20_IMPL_ADDR,
        encode(NORMAL_PROXY_BYTECODE_2),
        encode(TRADING_PROXY_BYTECODE_1),
        TRADING_MINT_IMPL_ADDR,
        encode(TRADING_PROXY_BYTECODE_2),
        TRADING_EXTRAS_IMPL_ADDR,
        encode(TRADING_PROXY_BYTECODE_3),
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
