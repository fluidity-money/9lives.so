//! ```cargo
//! [dependencies]
//! stylus-sdk = "=0.6.0"
//! alloy-primitives = "=0.7.6"
//! ```
use std::{env, str::FromStr};
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
fn main() {
    let args: Vec<String> = env::args().collect();
    if args.len() != 4 {
        eprintln!("Usage: cargo run -- <committer> <outcome> <seed>");
        return;
    }
    let committer = args[1]
        .parse::<Address>()
        .expect("Invalid committer address");
    let outcome = FixedBytes::<8>::from_str(&args[2]).expect("Invalid outcome");
    let seed = U256::from_str(&args[3]).expect("Invalid seed");

    let commit_hash = create_commit(committer, outcome, seed);
    println!("{}", commit_hash);
}
