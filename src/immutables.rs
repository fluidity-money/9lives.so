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

// Trading bytecode followed by the extras impl address.
pub const TRADING_PROXY_BYTECODE_1: [u8; 30] = [
    0x60, 0x59, 0x80, 0x60, 0x09, 0x3d, 0x39, 0x3d, 0xf3, 0x36, 0x5f, 0x5f, 0x37, 0x5f, 0x5f, 0x36,
    0x5f, 0x60, 0x02, 0x35, 0x5f, 0x1a, 0x60, 0x01, 0x14, 0x61, 0x00, 0x2d, 0x57, 0x73,
];

pub const TRADING_PROXY_BYTECODE_2: [u8; 6] = [0x61, 0x00, 0x47, 0x56, 0x5b, 0x73];

// Preceded by the mints address.
pub const TRADING_PROXY_BYTECODE_3: [u8; 22] = [
    0x61, 0x00, 0x47, 0x56, 0x5b, 0x5a, 0xf4, 0x5f, 0x3d, 0x5f, 0x5f, 0x3e, 0x3d, 0x91, 0x15, 0x61,
    0x00, 0x57, 0x57, 0xf3, 0x5b, 0xfd,
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
        TRADING_EXTRAS_IMPL_ADDR_BYTES,
        TRADING_PROXY_BYTECODE_2,
        TRADING_MINT_IMPL_ADDR_BYTES,
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
