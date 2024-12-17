/// All of these immutable variables should be set with an environment
/// variable, and are in some cases (ie, the Factory), configured based on
/// nonce management. We have a preference for online keccak256,
/// but we use a constant function here to simplify CREATE2 interaction.
use stylus_sdk::alloy_primitives::{Address, U256, U64};

use array_concat::{concat_arrays, concat_arrays_size};

use keccak_const::Keccak256;

macro_rules! env_addr {
    ($name:ident, $input:literal, $default:expr) => {
        #[cfg(not(feature = "testing"))]
        paste::paste! {
            const [<$name _BYTES>]: [u8; 20] = match const_hex::const_decode_to_array::<20>(env!($input).as_bytes()) {
                Ok(res) => res,
                Err(_) => panic!(),
            };
            pub const $name: Address = Address::new([<$name _BYTES>]);
        }
        #[cfg(feature = "testing")]
        pub const $name: Address = Address::new($default);
    };
}

// fUSDC address to use as the base asset for everything.
env_addr!(FUSDC_ADDR, "SPN_FUSDC_ADDR", [7u8; 20]);

// Longtail's address as deployed.
env_addr!(LONGTAIL_ADDR, "SPN_LONGTAIL_ADDR", [8u8; 20]);

// Staked ARB address to use for taking amounts for Infrastructure Markets.
env_addr!(STAKED_ARB_ADDR, "SPN_STAKED_ARB_ADDR", [9u8; 20]);

// Scaled amount to use for drawing down funds on request based on a
// percentage.
pub const SCALING_FACTOR: U256 = U256::from_limbs([1e12 as u64, 0, 0, 0]);

// Scaling amount for checking if a bad predictor went above 50% in their
// incorrect bets relative ot the winning outcome.
pub const FIFTY_PCT_SCALING: U256 = U256::from_limbs([100, 0, 0, 0]);

/// Three hours in seconds to determine if we're inside the buffer window.
pub const THREE_HOURS_SECS: U64 = U64::from_limbs([60 * 60 * 3]);

/// The minimum amount that must be paid to purchase into the Trading
/// contract, if it's within a 3 hour closing window.
pub const THREE_HOUR_WINDOW_MIN_BUYIN: U256 = U256::from_limbs([1e7 as u64, 0, 0, 0]);

// Minimal viable proxy bytecode.
pub const NORMAL_PROXY_BYTECODE_1: [u8; 18] = [
    0x60, 0x2d, 0x5f, 0x81, 0x60, 0x09, 0x5f, 0x39, 0xf3, 0x5f, 0x5f, 0x36, 0x5f, 0x5f, 0x37, 0x36,
    0x5f, 0x73,
];

pub const NORMAL_PROXY_BYTECODE_2: [u8; 16] = [
    0x5a, 0xf4, 0x3d, 0x5f, 0x5f, 0x3e, 0x60, 0x29, 0x57, 0x3d, 0x5f, 0xfd, 0x5b, 0x3d, 0x5f, 0xf3,
];

// Trading bytecode followed by the extras impl address.
pub const TRADING_PROXY_BYTECODE_1: [u8; 46] = [
    0x60, 0x9f, 0x80, 0x60, 0x09, 0x3d, 0x39, 0x3d, 0xf3, 0x36, 0x5f, 0x5f, 0x37, 0x5f, 0x5f, 0x36,
    0x5f, 0x60, 0x02, 0x35, 0x5f, 0x1a, 0x80, 0x60, 0x01, 0x14, 0x61, 0x00, 0x3d, 0x57, 0x80, 0x60,
    0x02, 0x14, 0x61, 0x00, 0x58, 0x57, 0x60, 0x03, 0x14, 0x61, 0x00, 0x73, 0x57, 0x73,
];

// Trading bytecode followed by the mint address.
pub const TRADING_PROXY_BYTECODE_2: [u8; 7] = [0x61, 0x00, 0x8d, 0x56, 0x5b, 0x50, 0x73];

// Trading bytecode followed by the quotes impl address.
pub const TRADING_PROXY_BYTECODE_3: [u8; 7] = [0x61, 0x00, 0x8d, 0x56, 0x5b, 0x50, 0x73];

// Trading bytecode followed by the price impl address.
pub const TRADING_PROXY_BYTECODE_4: [u8; 6] = [0x61, 0x00, 0x8d, 0x56, 0x5b, 0x73];

// Final bit of the trading bytecode.
pub const TRADING_PROXY_BYTECODE_5: [u8; 22] = [
    0x61, 0x00, 0x8d, 0x56, 0x5b, 0x5a, 0xf4, 0x5f, 0x3d, 0x5f, 0x5f, 0x3e, 0x3d, 0x91, 0x15, 0x61,
    0x00, 0x9d, 0x57, 0xf3, 0x5b, 0xfd,
];

pub fn boring_proxy_code(
    addr: Address,
) -> [u8; 20 + concat_arrays_size!(NORMAL_PROXY_BYTECODE_1, NORMAL_PROXY_BYTECODE_2)] {
    concat_arrays!(
        NORMAL_PROXY_BYTECODE_1,
        addr.into_array(),
        NORMAL_PROXY_BYTECODE_2
    )
}

pub fn trading_proxy_code(
    extras_addr: Address,
    mint_addr: Address,
    quotes_addr: Address,
    price_addr: Address,
) -> [u8; (4 * 20)
       + concat_arrays_size!(
    TRADING_PROXY_BYTECODE_1,
    TRADING_PROXY_BYTECODE_2,
    TRADING_PROXY_BYTECODE_3,
    TRADING_PROXY_BYTECODE_4,
    TRADING_PROXY_BYTECODE_5
)] {
    concat_arrays!(
        TRADING_PROXY_BYTECODE_1,
        extras_addr.into_array(),
        TRADING_PROXY_BYTECODE_2,
        mint_addr.into_array(),
        TRADING_PROXY_BYTECODE_3,
        quotes_addr.into_array(),
        TRADING_PROXY_BYTECODE_4,
        price_addr.into_array(),
        TRADING_PROXY_BYTECODE_5
    )
}

pub fn erc20_proxy_hash(erc20_impl: Address) -> [u8; 32] {
    Keccak256::new()
        .update(&boring_proxy_code(erc20_impl))
        .finalize()
}

pub fn trading_proxy_hash(
    extras: Address,
    mint: Address,
    quotes: Address,
    price: Address,
) -> [u8; 32] {
    Keccak256::new()
        .update(&trading_proxy_code(extras, mint, quotes, price))
        .finalize()
}

// fUSDC decimals should be this low!
pub const FUSDC_DECIMALS: u8 = 6;

// fUSDC decimals (1e6) that are in an exp-able form.
pub const FUSDC_DECIMALS_EXP: U256 = U256::from_limbs([1000000, 0, 0, 0]);

// Share decimals should be this low!
pub const SHARE_DECIMALS: u8 = 6;

// Share decimals (1e6) that are in an exp-able form.
pub const SHARE_DECIMALS_EXP: U256 = U256::from_limbs([1000000, 0, 0, 0]);

pub const LONGTAIL_FEE: u32 = 3000;

pub const LONGTAIL_TICK_SPACING: u8 = 10;

pub const LONGTAIL_MAX_LIQ_PER_TICK: u128 = u128::MAX;

/// Minimum amount of fUSDC that can be minted with.
pub const MINIMUM_MINT_AMT: i64 = 0;
