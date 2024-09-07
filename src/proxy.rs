use stylus_sdk::{
    alloy_primitives::{Address, FixedBytes, U256},
    crypto,
    deploy::RawDeploy,
};

// Sort and concatenate the seeds given, ABI format them, then hash them,
// using an offline keccak256 calculation with the native operation.
pub fn create_identifier(seeds: &[&[u8]]) -> FixedBytes<32> {
    // Sort the seeds in a new vector.
    let mut seeds = Vec::from(seeds);
    seeds.sort();
    crypto::keccak(seeds.concat())
}

fn make_proxy_code(addr: Address) -> [u8; 124] {
    //https://github.com/jtriley-eth/minimum-viable-proxy/blob/main/src/Deployer.sol#L8C31-L8C259
    let mut b: [u8; 124] = [
        0x60, 0x20, 0x80, 0x38, 0x03, 0x3d, 0x39, 0x3d, 0x51, 0x7f, 0x36, 0x08, 0x94, 0xa1, 0x3b,
        0xa1, 0xa3, 0x21, 0x06, 0x67, 0xc8, 0x28, 0x49, 0x2d, 0xb9, 0x8d, 0xca, 0x3e, 0x20, 0x76,
        0xcc, 0x37, 0x35, 0xa9, 0x20, 0xa3, 0xca, 0x50, 0x5d, 0x38, 0x2b, 0xbc, 0x55, 0x60, 0x3e,
        0x80, 0x60, 0x34, 0x3d, 0x39, 0x3d, 0xf3, 0x36, 0x3d, 0x3d, 0x37, 0x3d, 0x3d, 0x36, 0x3d,
        0x7f, 0x36, 0x08, 0x94, 0xa1, 0x3b, 0xa1, 0xa3, 0x21, 0x06, 0x67, 0xc8, 0x28, 0x49, 0x2d,
        0xb9, 0x8d, 0xca, 0x3e, 0x20, 0x76, 0xcc, 0x37, 0x35, 0xa9, 0x20, 0xa3, 0xca, 0x50, 0x5d,
        0x38, 0x2b, 0xbc, 0x54, 0x5a, 0xf4, 0x3d, 0x60, 0x00, 0x80, 0x3e, 0x61, 0x00, 0x39, 0x57,
        0x3d, 0x60, 0x00, 0xfd, 0x5b, 0x3d, 0x60, 0x00, 0xf3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    ];
    b[114..].copy_from_slice(addr.as_slice());
    b
}

// Deploy a new proxy using CREATE2 and the seed given. Returns the
// address.
pub fn deploy(seed: FixedBytes<32>, contract_impl: Address) -> Result<Address, Vec<u8>> {
    let d = RawDeploy::new().salt(seed);
    let c = make_proxy_code(contract_impl);
    unsafe { d.deploy(&c, U256::ZERO) }
}
