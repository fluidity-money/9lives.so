use stylus_sdk::alloy_primitives::{FixedBytes, U256};

use crate::calldata::{write_b8, write_selector, write_u256};

//disableShares(bytes8[])
const DISABLE_SHARES_SELECTOR: [u8; 4] = [0x58, 0x77, 0x03, 0xdb];

pub fn pack_disable_shares(outcomes: &[FixedBytes<8>]) -> Vec<u8> {
    // Create a array type here
    let mut b = vec![0; 4 + 64 + outcomes.len() * 32];
    write_selector(&mut b, &DISABLE_SHARES_SELECTOR);
    write_u256(&mut b, 0, U256::from(32)); // Offset
    write_u256(&mut b, 1, U256::from(outcomes.len())); // Length

    // Not true RLP encoding! FIXME

    for (i, id) in outcomes.iter().enumerate() {
        write_b8(&mut b, 2 + i, *id);
    }

    b
}

#[test]
fn test_disable_shares() {
    //cast calldata 'disableShares(bytes8[])' '[0x0011223300112233, 0x0011223300112233]'
    let b = const_hex::encode(&pack_disable_shares(&[
        FixedBytes::from_slice(&[0x00, 0x11, 0x22, 0x33, 0x00, 0x11, 0x22, 0x33]),
        FixedBytes::from_slice(&[0x00, 0x11, 0x22, 0x33, 0x00, 0x11, 0x22, 0x33]),
    ]));
    assert_eq!(b.to_string(), "587703db0000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000000200112233001122330000000000000000000000000000000000000000000000000011223300112233000000000000000000000000000000000000000000000000");
    //cast calldata 'disableShares(bytes8[])' '[0x0011223300112233, 0x9999999999999999, 0x2222222222222222]'
    let b = const_hex::encode(&pack_disable_shares(&[
        FixedBytes::from_slice(&[0x00, 0x11, 0x22, 0x33, 0x00, 0x11, 0x22, 0x33]),
        FixedBytes::from_slice(&[0x99, 0x99, 0x99, 0x99, 0x99, 0x99, 0x99, 0x99]),
        FixedBytes::from_slice(&[0x22, 0x22, 0x22, 0x22, 0x22, 0x22, 0x22, 0x22]),
    ]));
    assert_eq!(b.to_string(), "587703db00000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000003001122330011223300000000000000000000000000000000000000000000000099999999999999990000000000000000000000000000000000000000000000002222222222222222000000000000000000000000000000000000000000000000")
}
