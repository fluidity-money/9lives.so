use stylus_sdk::alloy_primitives::{Address, U256, FixedBytes};

pub fn pack_ctor<'a>(
    _contract: Address,
    _funder: Address,
    _oracle: Address,
    _outcomes: &[(FixedBytes<8>, U256)],
) -> &'a [u8] {
    &[]
}
