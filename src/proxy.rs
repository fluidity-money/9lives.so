use stylus_sdk::{
    alloy_primitives::{Address, FixedBytes},
    crypto,
};

use crate::immutables::erc20_proxy_hash;

/// Get the share address, using the address of the deployed Trading
/// contract, and the id associated with the winning outcome.
pub fn get_share_addr(
    factory_addr: Address,
    trading_addr: Address,
    erc20_impl: Address,
    outcome_id: FixedBytes<8>,
) -> Address {
    let erc20_id = crypto::keccak([trading_addr.as_slice(), outcome_id.as_slice()].concat());
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
        create_identifier(&[
            //bytes8(keccak256(abi.encodePacked("Yes", "", uint64(671424635701772))))
            &[0x72, 0xcf, 0xc9, 0x11, 0x63, 0x7a, 0xa0, 0xc4,],
            //bytes8(keccak256(abi.encodePacked("No", "", uint64(4374720138937106))))
            &[0xd2, 0xcd, 0x4a, 0x70, 0xce, 0x68, 0x85, 0xd5,],
        ]),
    )
}
