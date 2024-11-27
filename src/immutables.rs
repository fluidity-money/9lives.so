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

// fUSDC address to use as the base asset for everything.
env_addr!(FUSDC_ADDR, "SPN_FUSDC_ADDR");

// AMM address deployed (either Longtail or Camelot.)
env_addr!(AMM_ADDR, "SPN_AMM_ADDR");

// Staked ARB address to use for taking amounts for Infrastructure Markets.
env_addr!(STAKED_ARB_ADDR, "SPN_STAKED_ARB_ADDR");

// Address of the factory contract.
env_addr!(FACTORY_ADDR, "SPN_FACTORY_ADDR");

// Three days in seconds, for the infra market. This is when the market expires.
pub const THREE_DAYS_SECS: u64 = 259200;

// Scaling that's done for any fees taken from the incentive amount, or
// the mint fee amount.
pub const FEE_SCALING: U256 = U256::from_limbs([100, 0, 0, 0]);

// 5% of all trading to buy shares goes to the creator of the contract.
pub const MINT_FEE_PCT: U256 = U256::from_limbs([5, 0, 0, 0]);

// FIVE_DAYS_SECS powers ANYTHING GOES period where anyone can claim a
// victim (user who bet incorrectly in an infrastructure market)'s
// entire position. This is 5 days in seconds.
pub const FIVE_DAYS_SECS: u64 = 432000;

// A week in seconds, which is the point where users cannot claim from
// bad bettors in the infrastructure market anymore.
pub const A_WEEK_SECS: u64 = 604800;

// Scaled amount to use for drawing down funds on request based on a
// percentage.
pub const SCALING_FACTOR: U256 = U256::from_limbs([1e12 as u64, 0, 0, 0]);

// Scaling amount for checking if a bad predictor went above 50% in their
// incorrect bets relative ot the winning outcome.
pub const FIFTY_PCT_SCALING: U256 = U256::from_limbs([100, 0, 0, 0]);

// Incentive amount to take from users who create markets. $10 FUSDC.
pub const INCENTIVE_AMT_BASE: U256 = U256::from_limbs([1e7 as u64, 0, 0, 0]);

// Share of the incentive amount that we take for Fluidity Labs
// operations (10% of incentive amount base).
pub const INCENTIVE_AMT_MODERATION: U256 = U256::from_limbs([1e6 as u64, 0, 0, 0]);

// Amount that's sent to incentive callers of the sweep function (80% of
// the incentive amount base).
pub const INCENTIVE_AMT_SWEEP: U256 = U256::from_limbs([8000000, 0, 0, 0]);

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

pub fn erc20_proxy_code(
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
) -> [u8; (2 * 20)
       + concat_arrays_size!(
    TRADING_PROXY_BYTECODE_1,
    TRADING_PROXY_BYTECODE_2,
    TRADING_PROXY_BYTECODE_3
)] {
    concat_arrays!(
        TRADING_PROXY_BYTECODE_1,
        extras_addr.into_array(),
        TRADING_PROXY_BYTECODE_2,
        mint_addr.into_array(),
        TRADING_PROXY_BYTECODE_3
    )
}

pub fn erc20_proxy_hash(erc20_impl: Address) -> [u8; 32] {
    Keccak256::new()
        .update(&erc20_proxy_code(erc20_impl))
        .finalize()
}

pub fn trading_proxy_hash(
    trading_proxy_extras: Address,
    trading_proxy_impl: Address,
) -> [u8; 32] {
    Keccak256::new()
        .update(&trading_proxy_code(trading_proxy_extras, trading_proxy_impl))
        .finalize()
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

/// Minimum amount of fUSDC that can be minted with.
pub const MINIMUM_MINT_AMT: i64 = 1;
