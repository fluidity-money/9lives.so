extern crate alloc;

use stylus_sdk::{alloy_primitives::{Address, U256}, prelude::*, deploy::RawDeploy};

#[storage]
#[entrypoint]
pub struct Deployer {}

const TOKEN: [u8; 168] = match const_hex::const_decode_to_array(b"609f8060093d393df3365f5f375f5f365f6002355f1a8060011461003d5780600214610058576003146100735773400000000000000000000000000000000000000461008d565b5073100000000000000000000000000000000000000161008d565b5073200000000000000000000000000000000000000261008d565b73300000000000000000000000000000000000000361008d565b5af45f3d5f5f3e3d911561009d57f35bfd") {
    Ok(r) => r,
    _ => panic!()
};

#[public]
impl Deployer {
    pub fn hello() -> Result<Address, Vec<u8>> {
        unsafe { RawDeploy::new().deploy(&TOKEN, U256::ZERO) }
    }
}
