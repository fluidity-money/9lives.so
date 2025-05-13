use stylus_sdk::{
    alloy_primitives::{Address, FixedBytes},
    call::RawCall,
};

use stylus_sdk::alloy_sol_types::{sol, SolCall};

use crate::error::Error;

sol! {
    function register(
        address trading,
        bytes32 desc,
        uint64 launchTs,
        uint64 deadlineTs
    ) external;

}

// Call register on the infra market, disregarding the return value.
pub fn register(
    infra_market: Address,
    trading: Address,
    desc: FixedBytes<32>,
    launch_ts: u64,
    deadline_ts: u64,
) -> Result<(), Error> {
    unsafe {
        RawCall::new()
            .call(
                infra_market,
                &registerCall {
                    trading,
                    desc,
                    launchTs: launch_ts,
                    deadlineTs: deadline_ts,
                }
                .abi_encode(),
            )
            .map_err(Error::InfraMarketCallError)?;
    }
    Ok(())
}
