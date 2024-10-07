use stylus_sdk::alloy_primitives::{Address, FixedBytes};

fn addr_slice(s: FixedBytes<32>) -> Address {
    let mut b = [0_u8; 20];
    b[..20].copy_from_slice(&s.as_slice()[..20]);
    Address::from_slice(&b)
}

// Deploy a new ERC20 using CREATE2 and the seed given. Returns the
// address.
pub fn deploy_erc20(seed: FixedBytes<32>) -> Result<Address, Vec<u8>> {
    Ok(addr_slice(seed))
}

// Deploy a new Trading contract using CREATE2 and the seed given. Returns the
// address.
pub fn deploy_trading(seed: FixedBytes<32>) -> Result<Address, Vec<u8>> {
    Ok(addr_slice(seed))
}
