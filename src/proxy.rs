use stylus_sdk::{
    alloy_primitives::{Address, FixedBytes, U256},
    crypto,
    deploy::RawDeploy,
};

use crate::immutables::{erc20_proxy_code, trading_proxy_code, erc20_proxy_hash, FACTORY_ADDR};

// Sort and concatenate the seeds given, ABI format them, then hash them,
// using an offline keccak256 calculation with the native operation.
pub fn create_identifier(seeds: &[&[u8]]) -> FixedBytes<32> {
    // Sort the seeds in a new vector.
    let mut seeds = Vec::from(seeds);
    seeds.sort();
    crypto::keccak(seeds.concat())
}

// Deploy a new ERC20 using CREATE2 and the seed given. Returns the
// address.
pub fn deploy_erc20(seed: FixedBytes<32>) -> Result<Address, Vec<u8>> {
    let d = RawDeploy::new().salt(seed);
    let c = erc20_proxy_code();
    unsafe { d.deploy(&c, U256::ZERO) }
}

// Deploy a new Trading contract using CREATE2 and the seed given. Returns the
// address.
pub fn deploy_trading(seed: FixedBytes<32>) -> Result<Address, Vec<u8>> {
    let d = RawDeploy::new().salt(seed);
    let c = trading_proxy_code();
    unsafe { d.deploy(&c, U256::ZERO) }
}

// Get the share address, using the address of the deployed Trading
// contract, and the id associated with the winning outcome.
pub fn get_share_addr(our_addr: Address, outcome_id: FixedBytes<8>) -> Address {
    let erc20_id = create_identifier(&[our_addr.as_slice(), outcome_id.as_slice()]);
    let mut b = [0xff_u8; 64];
    b[1..20].copy_from_slice(FACTORY_ADDR.as_slice());
    b[20..32].copy_from_slice(erc20_id.as_slice());
    b[32..64].copy_from_slice(&erc20_proxy_hash());
    Address::from_slice(&b)
}

#[test]
fn test_make_proxy_code() {
    use const_hex::const_encode;
    use stylus_sdk::alloy_primitives::address;
    // Tested to know it deploys fine!
    assert_eq!(const_encode::<134, false>(&make_proxy_code(address!(
        "a7390dA200fcB4ce8C1032Cc024779F488B0D03a"
    ))).to_string(), "60208038033d393d517f360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc55603e8060343d393df3363d3d373d3d363d7f360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc545af43d6000803e610039573d6000fd5b3d6000f3a7390da200fcb4ce8c1032cc024779f488b0d03a")
}
