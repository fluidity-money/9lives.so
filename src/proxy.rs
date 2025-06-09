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
#[macro_export]
macro_rules! proxy_in_place_sort_and_create_id {
    ($seeds:expr) => {{
        // Sort the seeds in place by length first, then by default.
        $seeds.sort_by(|a, b| a.len().cmp(&b.len()).then(a.cmp(b)));
        stylus_sdk::crypto::keccak($seeds.concat())
    }};
}

pub fn get_trading_addr(
    factory_addr: Address,
    is_dpm: bool,
    outcome_ids: &[FixedBytes<8>],
) -> Address {
    let trading_id =
        proxy_in_place_sort_and_create_id!(outcome_ids.iter().map(|c| c.as_slice()).collect::<Vec<_>>());
    let mut b = [0_u8; 85];
    b[0] = 0xff;
    b[1..21].copy_from_slice(factory_addr.as_slice());
    // Leaving some spacing so that we can have an empty part of the word.
    b[21..53].copy_from_slice(trading_id.as_slice());
    b[53..85].copy_from_slice(&trading_proxy_hash(factory_addr, is_dpm));
    Address::from_slice(&crypto::keccak(b).as_slice()[12..])
}

/// Get the share address, using the address of the deployed Trading
/// contract, and the id associated with the winning outcome.
pub fn get_share_addr(
    factory_addr: Address,
    trading_addr: Address,
    erc20_impl: Address,
    outcome_id: FixedBytes<8>,
) -> Address {
    let erc20_id =
        proxy_in_place_sort_and_create_id!([trading_addr.as_slice(), outcome_id.as_slice()]);
    let mut b = [0_u8; 85];
    b[0] = 0xff;
    b[1..21].copy_from_slice(factory_addr.as_slice());
    // Leaving some spacing so that we can have an empty part of the word.
    b[21..53].copy_from_slice(erc20_id.as_slice());
    b[53..85].copy_from_slice(&erc20_proxy_hash(erc20_impl));
    let x = Address::from_slice(&crypto::keccak(b).as_slice()[12..]);
    x
}

#[test]
fn test_create_identifier() {
    assert_eq!(
        FixedBytes::from_slice(
            &const_hex::decode("c27b300def7bb415cd56c150b2cb186e10a55980a39d974f8c6feb083f745514")
                .unwrap()
        ),
        proxy_in_place_sort_and_create_id!([
            //bytes8(keccak256(abi.encodePacked("Yes", "", uint64(671424635701772))))
            FixedBytes::<8>::from([0x72, 0xcf, 0xc9, 0x11, 0x63, 0x7a, 0xa0, 0xc4,]),
            //bytes8(keccak256(abi.encodePacked("No", "", uint64(4374720138937106))))
            FixedBytes::<8>::from([0xd2, 0xcd, 0x4a, 0x70, 0xce, 0x68, 0x85, 0xd5,]),
        ]),
    )
}
