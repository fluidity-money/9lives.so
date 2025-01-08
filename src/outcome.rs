use stylus_sdk::{
    alloy_primitives::{Address, FixedBytes, U256},
    crypto::keccak,
};

pub fn create_commit(committer: Address, outcome: FixedBytes<8>, seed: U256) -> FixedBytes<32> {
    let mut v: [u8; 20 + 8 + 32] = [0; 60];
    v[..20].copy_from_slice(committer.as_slice());
    v[20..28].copy_from_slice(outcome.as_slice());
    v[28..].copy_from_slice(&seed.to_be_bytes::<32>());
    keccak(v)
}
