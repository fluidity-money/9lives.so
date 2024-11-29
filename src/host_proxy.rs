use stylus_sdk::alloy_primitives::{Address, FixedBytes};

fn addr_slice(s: FixedBytes<32>) -> Address {
    let mut b = [0_u8; 20];
    b[..20].copy_from_slice(&s.as_slice()[..20]);
    Address::from_slice(&b)
}

// Deploy a new ERC20 using CREATE2 and the seed given. Returns the
// address.
pub fn deploy_erc20(_erc20_impl: Address, seed: FixedBytes<32>) -> Result<Address, Vec<u8>> {
    Ok(addr_slice(seed))
}

pub fn deploy_proxy(_impl_addr: Address) -> Result<Address, Vec<u8>> {
    Ok(Address::from([9_u8; 20]))
}

// Deploy a new Trading contract using CREATE2 and the seed given. Returns the
// address.
pub fn deploy_trading(
    _trading_extras: Address,
    _trading_mint: Address,
    _trading_quotes: Address,
    _trading_price: Address,
    seed: FixedBytes<32>,
) -> Result<Address, Vec<u8>> {
    Ok(addr_slice(seed))
}
