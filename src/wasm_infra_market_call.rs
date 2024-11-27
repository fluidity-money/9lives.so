use stylus_sdk::{
    alloy_primitives::{Address, FixedBytes},
    call::RawCall,
};

use alloy_sol_macro::sol;

use alloy_sol_types::SolCall;

use crate::error::Error;

sol! {
    function register(
        address trading,
        address incentiveSender,
        bytes32 desc,
        uint64 launchTs
    ) external;

}

pub fn register(
    infra_market: Address,
    trading: Address,
    incentive_sender: Address,
    desc: FixedBytes<32>,
    launch_ts: u64,
) -> Result<(), Error> {
    RawCall::new()
        .call(
            infra_market,
            &registerCall {
                trading,
                incentiveSender: incentive_sender,
                desc,
                launchTs: launch_ts,
            }
            .abi_encode(),
        )
        .map_err(Error::InfraMarketCallError)?;
    Ok(())
}
