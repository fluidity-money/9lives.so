use stylus_sdk::alloy_sol_types::sol;

sol!("src/IEvents.sol");

#[derive(Debug)]
#[repr(C)]
pub enum BackendType {
    DPM = 0,
    AMM = 1
}

impl Into<u8> for BackendType {
    fn into(self) -> u8 { self as u8 }
}

pub use IEvents::*;
