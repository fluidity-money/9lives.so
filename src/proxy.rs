use stylus_sdk::{
    alloy_primitives::{Address, FixedBytes},
    crypto,
};

use crate::{
    immutables::{erc20_proxy_hash, trading_proxy_hash},
    proxy,
};

#[cfg(target_arch = "wasm32")]
pub use crate::wasm_proxy::*;

#[cfg(not(target_arch = "wasm32"))]
pub use crate::host_proxy::*;

// Sort and concatenate the seeds given, ABI format them, then hash them,
// using an offline keccak256 calculation with the native operation.
pub fn create_identifier(seeds: &[&[u8]]) -> FixedBytes<8> {
    // Sort the seeds in a new vector.
    let mut seeds = Vec::from(seeds);
    seeds.sort();
    FixedBytes::<8>::from_slice(&crypto::keccak(seeds.concat())[..8])
}

pub fn get_trading_addr(factory_addr: Address, outcome_ids: &[FixedBytes<8>]) -> Address {
    let trading_id =
        proxy::create_identifier(&outcome_ids.iter().map(|c| c.as_slice()).collect::<Vec<_>>());
    let mut b = [0_u8; 85];
    b[0] = 0xff;
    b[1..21].copy_from_slice(factory_addr.as_slice());
    // Leaving some spacing so that we can have an empty part of the word.
    b[21..29].copy_from_slice(&trading_id.as_slice());
    b[53..85].copy_from_slice(&trading_proxy_hash());
    Address::from_slice(&crypto::keccak(&b).as_slice()[12..])
}

// Get the share address, using the address of the deployed Trading
// contract, and the id associated with the winning outcome.
pub fn get_share_addr(
    factory_addr: Address,
    trading_addr: Address,
    outcome_id: FixedBytes<8>,
) -> Address {
    let erc20_id = create_identifier(&[trading_addr.as_slice(), outcome_id.as_slice()]);
    let mut b = [0_u8; 85];
    b[0] = 0xff;
    b[1..21].copy_from_slice(factory_addr.as_slice());
    // Leaving some spacing so that we can have an empty part of the word.
    b[21..29].copy_from_slice(&erc20_id.as_slice());
    b[53..85].copy_from_slice(&erc20_proxy_hash());
    Address::from_slice(&crypto::keccak(&b).as_slice()[12..])
}

#[test]
fn test_create_identifier() {
    assert_eq!(
        create_identifier(&[
            &[0x12, 0x34, 0x12, 0x34, 0x12, 0x34, 0x12, 0x34],
            &[0x22, 0x34, 0x12, 0x34, 0x12, 0x34, 0x12, 0x34],
        ]),
        FixedBytes::from_slice(&[
            0x5e, 0x06, 0xb4, 0x24, 0x49, 0xd1, 0xec, 0xd7
        ])
    )
}

#[test]
fn test_get_trading_addr() {
    use stylus_sdk::alloy_primitives::address;
    let factory = address!("7FA9385bE102ac3EAc297483Dd6233D62b3e1496");
    let outcomes = [
        [0x12, 0x34, 0x12, 0x34, 0x12, 0x34, 0x12, 0x34],
        [0x22, 0x34, 0x12, 0x34, 0x12, 0x34, 0x12, 0x34],
    ]
    .map(FixedBytes::<8>::from);
    assert_eq!(
        const_hex::encode(proxy::create_identifier(
            &outcomes.iter().map(|c| c.as_slice()).collect::<Vec<_>>()
        )),
        "5e06b42449d1ecd7"
    );
    assert_eq!(
        get_trading_addr(factory, &outcomes),
        address!("CeEA6fe14d7e99aeD1da3a4208940E334222ec9E")
    )
}
