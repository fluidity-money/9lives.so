use stylus_sdk::{
    alloy_primitives::{Address, FixedBytes},
    call::RawCall,
};

use bobcat_cd::const_keccak_sel;

use crate::error::Error;

use array_concat::concat_arrays;

const SEL_REGISTER: [u8; 4] = const_keccak_sel(b"register(address,bytes32,uint64,uint64)");

pub fn register(
    infra_market: Address,
    trading: Address,
    desc: FixedBytes<32>,
    launch_ts: u64,
    deadline_ts: u64,
) -> Result<(), Error> {
    let mut launch_ts_word = [0u8; 32];
    launch_ts_word[24..32].copy_from_slice(&launch_ts.to_be_bytes());
    let mut deadline_ts_word = [0u8; 32];
    deadline_ts_word[24..32].copy_from_slice(&deadline_ts.to_be_bytes());
    let cd: [u8; 4 + 32 * 4] = concat_arrays!(
        SEL_REGISTER,
        trading.into_word().0,
        desc.0,
        launch_ts_word,
        deadline_ts_word
    );
    unsafe { RawCall::new().call(infra_market, &cd) }.map_err(Error::InfraMarketCallError)?;
    Ok(())
}
