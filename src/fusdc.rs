use stylus_sdk::alloy_primitives::{Address, U256};

pub fn take_from_sender(_funder: Address, _amount: U256) -> Result<(), Vec<u8>> {
    Ok(())
}
