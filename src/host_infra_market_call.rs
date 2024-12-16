

use stylus_sdk::alloy_primitives::{Address, FixedBytes};

use crate::error::Error;

pub fn register(
    _infra_market: Address,
    _trading: Address,
    _incentive_sender: Address,
    _desc: FixedBytes<32>,
    _launch_ts: u64,
    _deadline_ts: u64
) -> Result<(), Error> {
    Ok(())
}
