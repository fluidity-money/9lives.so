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
