use stylus_sdk::{
    alloy_primitives::{Address, FixedBytes, U256},
    contract, msg,
};

pub fn take_from_sender(_amount: U256) -> Result<(), Vec<u8>> {
    take_from_funder(msg::sender(), _amount);
}

pub fn take_from_funder(_funder: Address, _amount: U256) -> Result<(), Vec<u8>> {
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
