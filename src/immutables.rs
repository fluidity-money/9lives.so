use stylus_sdk::alloy_primitives::{address, Address};

pub const FUSDC_ADDR: Address = address!("feb6034fc7df27df18a3a6bad5fb94c0d3dcb6d5");

pub const FUSDC_DECIMALS: u8 = 6;

pub const SHARE_DECIMALS: u8 = 18;

pub const FEE_RECIPIENT: Address = address!("0000000000000000000000000000000000000000");

pub const LONGTAIL_FEE: u32 = 3000;

pub const LONGTAIL_TICK_SPACING: u8 = 10;

pub const LONGTAIL_MAX_LIQ_PER_TICK: u128 = u128::MAX;
