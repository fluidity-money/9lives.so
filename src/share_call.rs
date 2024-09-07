use stylus_sdk::alloy_primitives::{Address, U256};

// Construct the ERC20 with the description in bytes provided, and an
// admin that can mint more tokens on request.
pub fn ctor(_addr: Address, _description: &[u8], _admin: Address) -> Result<(), Vec<u8>> {
    Ok(())
}

pub fn balance(_addr: Address, _spender: Address) -> Result<U256, Vec<u8>> {
    Ok(U256::from(0))
}

pub fn burn(_addr: Address, _spender: Address, _amount: U256) -> Result<(), Vec<u8>> {
    Ok(())
}

pub fn mint(_addr: Address, _spender: Address, _amount: U256) -> Result<(), Vec<u8>> {
    Ok(())
}
