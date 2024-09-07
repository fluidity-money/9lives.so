use stylus_sdk::alloy_primitives::{Address, U256};

pub fn pack_create_pool(
    _erc20: Address,
    _price: U256,
    _fee: u32,
    _spacing: u8,
    _liq_per_tick: u128,
) -> [u8; 8 + 32 * 5] {
    [0_u8; 8 + 32 * 5]
}
