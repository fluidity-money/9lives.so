use stylus_sdk::{
    alloy_primitives::{Address, FixedBytes, U256},
    alloy_sol_types::{sol, SolCall},
};

sol! {
    function ctor(address oracle, (bytes8,uint256)[] outcomes);
}

pub fn pack_ctor(
    oracle: Address,
    outcomes: Vec<(FixedBytes<8>, U256)>,
) -> Vec<u8> {
    let call = ctorCall {
        oracle,
        outcomes,
    };
    call.abi_encode()
}
