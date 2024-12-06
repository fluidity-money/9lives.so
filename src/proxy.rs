use stylus_sdk::{
    alloy_primitives::{Address, FixedBytes},
    crypto,
};

use alloc::vec::Vec;

use crate::immutables::{erc20_proxy_hash, trading_proxy_hash};

#[cfg(target_arch = "wasm32")]
pub use crate::wasm_proxy::*;

#[cfg(not(target_arch = "wasm32"))]
pub use crate::host_proxy::*;

// Sort and concatenate the seeds given, ABI format them, then hash them,
// using an online keccak256 calculation with the native operation.
pub fn create_identifier(seeds: &[&[u8]]) -> FixedBytes<32> {
    // Sort the seeds in a new vector by length first, then by default.
    let mut seeds = Vec::from(seeds);
    seeds.sort_by(|a, b| a.len().cmp(&b.len()).then(a.cmp(b)));
    crypto::keccak(seeds.concat())
}

pub fn get_trading_addr(
    factory_addr: Address,
    trading_extras: Address,
    trading_mint: Address,
    trading_quotes: Address,
    trading_price: Address,
    outcome_ids: &[FixedBytes<8>],
) -> Address {
    let trading_id =
        create_identifier(&outcome_ids.iter().map(|c| c.as_slice()).collect::<Vec<_>>());
    let mut b = [0_u8; 85];
    b[0] = 0xff;
    b[1..21].copy_from_slice(factory_addr.as_slice());
    // Leaving some spacing so that we can have an empty part of the word.
    b[21..53].copy_from_slice(trading_id.as_slice());
    b[53..85].copy_from_slice(&trading_proxy_hash(
        trading_extras,
        trading_mint,
        trading_quotes,
        trading_price,
    ));
    Address::from_slice(&crypto::keccak(b).as_slice()[12..])
}

// Get the share address, using the address of the deployed Trading
// contract, and the id associated with the winning outcome.
pub fn get_share_addr(
    factory_addr: Address,
    trading_addr: Address,
    erc20_impl: Address,
    outcome_id: FixedBytes<8>,
) -> Address {
    let erc20_id = create_identifier(&[trading_addr.as_slice(), outcome_id.as_slice()]);
    let mut b = [0_u8; 85];
    b[0] = 0xff;
    b[1..21].copy_from_slice(factory_addr.as_slice());
    // Leaving some spacing so that we can have an empty part of the word.
    b[21..53].copy_from_slice(erc20_id.as_slice());
    b[53..85].copy_from_slice(&erc20_proxy_hash(erc20_impl));
    Address::from_slice(&crypto::keccak(b).as_slice()[12..])
}

#[test]
fn test_create_identifier() {
    assert_eq!(
        FixedBytes::from_slice(
            &const_hex::decode("39724fec301ea7b725bb44b4273e1f4aa8c429ff4dc7e8d63dabd70ba4c32cd1")
                .unwrap()
        ),
        create_identifier(&[
            //bytes8(keccak256(abi.encodePacked("Yes", "", uint64(671424635701772))))
            &[0x72,0xcf,0xc9,0x11,0x63,0x7a,0xa0,0xc4,],
            //bytes8(keccak256(abi.encodePacked("No", "", uint64(4374720138937106))))
            &[0xd2,0xcd,0x4a,0x70,0xce,0x68,0x85,0xd5,],
        ]),
    )
}
