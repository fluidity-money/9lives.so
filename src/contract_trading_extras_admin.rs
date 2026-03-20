// This exports user_entrypoint, which we need to have the entrypoint code.
pub use crate::{
    error::*,
    fusdc_call,
    immutables::{DAO_OP_ADDR, DAO_EARN_ADDR},
    storage_trading::*,
    trading_call,
    utils::{contract_address, msg_sender},
};

#[allow(unused)]
use alloc::vec::Vec;

#[cfg_attr(feature = "contract-trading-extras-admin", stylus_sdk::prelude::public)]
impl StorageTrading {}
