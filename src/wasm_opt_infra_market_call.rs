use stylus_sdk::{
    alloy_primitives::{Address, FixedBytes},
    call::RawCall,
};

use stylus_sdk::alloy_sol_types::{SolCall, sol};

use crate::error::Error;

sol! {
    function register(
        address trading,
        address incentiveSender,
        bytes32 desc,
        uint64 launchTs,
        bytes8 defaultWinner
    ) external;

}

// Call register on the infra market, disregarding the return value.
pub fn register(
    infra_market: Address,
    trading: Address,
    incentive_sender: Address,
    desc: FixedBytes<32>,
    launch_ts: u64,
    default_winner: FixedBytes<8>
) -> Result<(), Error> {
    RawCall::new()
        .call(
            infra_market,
            &registerCall {
                trading,
                incentiveSender: incentive_sender,
                desc,
                launchTs: launch_ts,
                defaultWinner: default_winner
            }
            .abi_encode(),
        )
        .map_err(Error::InfraMarketCallError)?;
    Ok(())
}
