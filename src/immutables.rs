/// All of these immutable variables should be set with an environment
/// variable, and are in some cases (ie, the Factory), configured based on
/// nonce management. We have a preference for online keccak256,
/// but we use a constant function here to simplify CREATE2 interaction.
use stylus_sdk::alloy_primitives::{Address, U256, U64};

use array_concat::{concat_arrays, concat_arrays_size};

use keccak_const::Keccak256;

#[cfg(all(not(target_arch = "wasm32"), feature = "testing"))]
use crate::testing_addrs;

macro_rules! env_addr {
    ($name:ident, $input:literal, $default:ident) => {
        #[cfg(not(feature = "testing"))]
        paste::paste! {
            const [<$name _BYTES>]: [u8; 20] = match const_hex::const_decode_to_array::<20>(env!($input).as_bytes()) {
                Ok(res) => res,
                Err(_) => panic!(),
            };
            pub const $name: Address = Address::new([<$name _BYTES>]);
        }
        #[cfg(feature = "testing")]
        pub const $name: Address = testing_addrs::$default;
    };
}

// fUSDC address to use as the base asset for everything.
env_addr!(FUSDC_ADDR, "SPN_FUSDC_ADDR", FUSDC);

// Longtail's address as deployed.
env_addr!(LONGTAIL_ADDR, "SPN_LONGTAIL_ADDR", LONGTAIL);

// Staked ARB address to use for taking amounts for Infrastructure Markets.
env_addr!(STAKED_ARB_ADDR, "SPN_STAKED_ARB_ADDR", STAKED_ARB);

// Address of the team fee recipient from the Trading contract. Used as the
// recipient address for fees, but is unable to claim the fees! The operator
// address must claim the fees, which are sent to this recipient.
env_addr!(DAO_EARN_ADDR, "SPN_DAO_EARN_ADDR", DAO_EARN);

// Trusted address that may use operations that will credit the DAO's earnings
// address.
env_addr!(DAO_OP_ADDR, "SPN_DAO_OP_ADDR", DAO_OPS);

// Special role that can do batch claiming for a recipient.
env_addr!(CLAIMANT_HELPER, "SPN_CLAIMANT_HELPER_ADDR", CLAIMANT);

// Address of the Paymaster, which needs special privileges like the
// Claimant helper, but only to support selling.
env_addr!(PAYMASTER_ADDR, "SPN_PAYMASTER_ADDR", PAYMASTER);

// Address of the trading beacon, which the trading contract will invoke
// during its proxy, and the factory will call to answer the legacy methods.
env_addr!(
    TRADING_BEACON_ADDR,
    "SPN_TRADING_BEACON_ADDR",
    TRADING_BEACON
);

// The recipient of clawback funds when a market wasn't used. DPPM only.
env_addr!(
    CLAWBACK_RECIPIENT_ADDR,
    "SPN_CLAWBACK_RECIPIENT_ADDR",
    CLAWBACK_RECIPIENT
);

// Liquidity and fees management middleware.
env_addr!(
    VAULT_ADDR,
    "SPN_VAULT_ADDR",
    VAULT
);

// Address that's allowed to create new campaigns using the dppm (the one
// hour creator):
env_addr!(
    DPPM_HOUR_CREATOR_ADDR,
    "SPN_HOUR_DPPM_CREATOR",
    DPPM_HOUR_CREATOR
);

// Address that's allowed to create new campaigns using the dppm (the 15
// minute creator):
env_addr!(
    DPPM_15_MIN_CREATOR_ADDR,
    "SPN_15_MIN_DPPM_CREATOR",
    DPPM_15_MIN_CREATOR
);

// Address that's allowed to create new campaigns using the dppm (the 5
// minute creator lane):
env_addr!(
    DPPM_5_MIN_CREATOR_ADDR,
    "SPN_5_MIN_DPPM_CREATOR",
    DPPM_5_MIN_CREATOR
);

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

pub fn trading_dppm_proxy(addr: Address) -> [u8; 90] {
    //dppmImpl(bytes4)
    bobcat_proxy::make_beacon_sel_proxy_sel([0x6f, 0x73, 0xcb, 0xd8], **addr)
}

pub fn trading_amm_proxy(addr: Address) -> [u8; 90] {
    //ammImpl(bytes4)
    bobcat_proxy::make_beacon_sel_proxy_sel([0x6b, 0x8e, 0x8d, 0x96], **addr)
}

pub fn boring_proxy_code(
    addr: Address,
) -> [u8; 20 + concat_arrays_size!(NORMAL_PROXY_BYTECODE_1, NORMAL_PROXY_BYTECODE_2)] {
    concat_arrays!(
        NORMAL_PROXY_BYTECODE_1,
        addr.into_array(),
        NORMAL_PROXY_BYTECODE_2
    )
}

pub fn erc20_proxy_hash(erc20_impl: Address) -> [u8; 32] {
    Keccak256::new()
        .update(&boring_proxy_code(erc20_impl))
        .finalize()
}

pub fn trading_proxy_hash(factory: Address, is_dppm: bool) -> [u8; 32] {
    Keccak256::new()
        .update(&if is_dppm {
            trading_dppm_proxy(factory)
        } else {
            trading_amm_proxy(factory)
        })
        .finalize()
}

// fUSDC decimals should be this low!
pub const FUSDC_DECIMALS: u8 = 6;

// fUSDC decimals (1e6) that are in an exp-able form.
pub const FUSDC_DECIMALS_EXP: U256 = U256::from_limbs([1000000, 0, 0, 0]);

// Share decimals should be this low!
pub const SHARE_DECIMALS: u8 = 6;

// Share decimals (1e6) that are in an exp-able form.
pub const SHARE_DECIMALS_EXP: U256 = U256::from_limbs([1e6 as u64, 0, 0, 0]);

// Staked ARB decimals for convinient use.
pub const STAKED_ARB_DECIMALS: u8 = 18;

// 1e18
pub const STAKED_ARB_DECIMALS_EXP: U256 = U256::from_limbs([1000000000000000000, 0, 0, 0]);

pub const LONGTAIL_FEE: u32 = 3000;

pub const LONGTAIL_TICK_SPACING: u8 = 10;

pub const LONGTAIL_MAX_LIQ_PER_TICK: u128 = u128::MAX;

/// Minimum amount of fUSDC that can be minted with.
pub const MINIMUM_MINT_AMT: i64 = 0;

/// We'll export the Crate version through the contract for feature branching.
pub const CARGO_PKG_VERSION: &'static str = match option_env!("CARGO_PKG_VERSION") {
    Some(v) => v,
    _ => panic!("CARGO_PKG_VERSION"),
};

#[cfg(all(test, not(target_arch = "wasm32")))]
mod test {
    use super::*;
    use stylus_sdk::alloy_primitives::address;

    #[test]
    #[ignore]
    fn test_print_cur_hash() {
        dbg!(const_hex::encode(erc20_proxy_hash(address!(
            "3e27e934344bf490457231Cb8F0c0eda7d60C362"
        ))));
    }
}
