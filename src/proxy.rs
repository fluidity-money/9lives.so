use stylus_sdk::{
    alloy_primitives::{Address, FixedBytes},
    crypto,
};

use crate::immutables::{erc20_proxy_hash, trading_proxy_hash};

#[cfg(target_arch = "wasm32")]
pub use crate::wasm_proxy::*;

#[cfg(not(target_arch = "wasm32"))]
pub use crate::host_proxy::*;

// Sort and concatenate the seeds given, ABI format them, then hash them,
// using an online keccak256 calculation with the native operation.
pub fn create_identifier(seeds: &[&[u8]]) -> FixedBytes<32> {
    // Sort the seeds in a new vector.
    let mut seeds = Vec::from(seeds);
    seeds.sort();
    crypto::keccak(seeds.concat())
}

pub fn get_trading_addr(factory_addr: Address, outcome_ids: &[FixedBytes<8>]) -> Address {
    let trading_id =
        create_identifier(&outcome_ids.iter().map(|c| c.as_slice()).collect::<Vec<_>>());
    let mut b = [0_u8; 85];
    b[0] = 0xff;
    b[1..21].copy_from_slice(factory_addr.as_slice());
    // Leaving some spacing so that we can have an empty part of the word.
    b[21..53].copy_from_slice(trading_id.as_slice());
    b[53..85].copy_from_slice(&trading_proxy_hash());
    Address::from_slice(&crypto::keccak(b).as_slice()[12..])
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
    b[21..53].copy_from_slice(erc20_id.as_slice());
    b[53..85].copy_from_slice(&erc20_proxy_hash());
    Address::from_slice(&crypto::keccak(b).as_slice()[12..])
}

#[test]
fn test_create_identifier() {
    assert_eq!(
        create_identifier(&[
            //bytes8(keccak256(abi.encodePacked("Koko", "Cat", uint8(0))))
            &[0x8f, 0x88, 0x59, 0x92, 0xca, 0xfd, 0x4d, 0x5c,],
            //bytes8(keccak256(abi.encodePacked("Leo", "Dog", uint8(0))))
            &[0x3b, 0x79, 0x56, 0x5a, 0x91, 0x5e, 0xb9, 0x50,],
        ]),
        FixedBytes::from_slice(
            &const_hex::decode("bb3fa3175331f414394239fac7252ead07157d0a449a362131f5554c02f43c04")
                .unwrap()
        ),
    )
}

#[test]
fn test_get_trading_addr() {
    use stylus_sdk::alloy_primitives::address;
    let factory = address!("7FA9385bE102ac3EAc297483Dd6233D62b3e1496");
    let outcomes = [
        //bytes8(keccak256(abi.encodePacked("Koko", "Cat", uint8(0))))
        [0x8f, 0x88, 0x59, 0x92, 0xca, 0xfd, 0x4d, 0x5c],
        //bytes8(keccak256(abi.encodePacked("Leo", "Dog", uint8(0))))
        [0x3b, 0x79, 0x56, 0x5a, 0x91, 0x5e, 0xb9, 0x50],
    ]
    .map(FixedBytes::<8>::from);
    assert_eq!(
        get_trading_addr(factory, &outcomes),
        address!("da7eac0f112e8ed91c951972c60f8147fe51bbd4")
    )
}
