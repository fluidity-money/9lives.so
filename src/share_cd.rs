use stylus_sdk::alloy_primitives::{Address, U256};

pub fn pack_mint(_spender: Address, _amount: U256) -> [u8; 8 + 32 * 2] {
    [0_u8; 8 + 32 * 2]
}

pub fn pack_burn(_spender: Address, _amount: U256) -> [u8; 8 + 32 * 2] {
    [0_u8; 8 + 32 * 2]
}
