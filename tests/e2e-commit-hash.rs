#![cfg(all(feature = "testing", not(target_arch = "wasm32")))]

use stylus_sdk::alloy_primitives::{address, fixed_bytes, U256};

use lib9lives::outcome::create_commit;

#[test]
#[ignore]
fn test_print_hash() {
    eprintln!(
        "{}",
        const_hex::encode(&create_commit(
            address!("d8e78951d5bd1dee358d9772464d45025338b6bf"),
            fixed_bytes!("21e44c00f545271b"),
            U256::from(123)
        ))
    );
    eprintln!(
        "{}",
        const_hex::encode(&create_commit(
            address!("d8e78951d5bd1dee358d9772464d45025338b6bf"),
            fixed_bytes!("21e44c00f545271b"),
            U256::from_str_radix("9007199254740991", 10).unwrap()
        ))
    );
    eprintln!(
        "{}",
        const_hex::encode(&create_commit(
            address!("d8e78951d5bd1dee358d9772464d45025338b6bf"),
            fixed_bytes!("21e44c00f545271b"),
            U256::from_str_radix("340282366920938463463374607431768211454", 10).unwrap()
        ))
    )
}
