
use stylus_sdk::alloy_primitives::{FixedBytes, Address, U256};

use crate::{error::Error, utils::{msg_sender, contract_address}};

pub use crate::erc20_call::{permit, transfer_from};

#[cfg(target_arch = "wasm32")]
pub use crate::wasm_share_call::*;

#[cfg(not(target_arch = "wasm32"))]
pub use crate::host_share_call::*;

pub fn take_from_sender(addr: Address, amount: U256) -> Result<(), Error> {
    transfer_from(addr, msg_sender(), contract_address(), amount)
}

pub fn take_from_sender_permit(
    addr: Address,
    value: U256,
    deadline: U256,
    v: u8,
    r: FixedBytes<32>,
    s: FixedBytes<32>,
) -> Result<(), Error> {
    permit(
        addr,
        contract_address(),
        msg_sender(),
        value,
        deadline,
        v,
        r,
        s,
    )
}