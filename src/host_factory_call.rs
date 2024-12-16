

use stylus_sdk::alloy_primitives::{Address, FixedBytes};

use crate::error::Error;

pub fn disable_shares(_addr: Address, _outcomes: &[FixedBytes<8>]) -> Result<(), Error> {
    Ok(())
}
