use stylus_sdk::{contract, msg, alloy_primitives::{Address, FixedBytes, U256}};

pub fn take_from_sender(_funder: Address, _amount: U256) -> Result<(), Vec<u8>> {
    Ok(())
}

pub fn take_from_sender_permit(
    _value: U256,
    _v: u8,
    _r: FixedBytes<8>,
    _s: FixedBytes<8>,
) -> Result<(), Vec<u8>> {
    Ok(())
}
