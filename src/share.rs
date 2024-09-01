use stylus_sdk::alloy_primitives::{Address};

// Construct the ERC20 with the description in bytes provided, and an
// admin that can mint more tokens on request.
pub fn ctor(_addr: Address, _description: &[u8], _admin: Address) -> Result<(), Vec<u8>> {
    Ok(())
}
