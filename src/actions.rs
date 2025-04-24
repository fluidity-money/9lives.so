use stylus_sdk::alloy_primitives::{Address, FixedBytes, U256};

use proptest::{prelude::*, prop_oneof};

// Actions for use in property testing/fuzzing.

#[derive(Clone, Debug, PartialEq, arbitrary::Arbitrary, proptest_derive::Arbitrary)]
pub struct ActionCtor {
    pub outcomes: Vec<FixedBytes<8>>,
    pub oracle: Address,
    pub time_start: u64,
    pub time_ending: u64,
    pub fee_recipient: Address,
    pub share_impl: Address,
    pub should_buffer_time: bool,
    pub fee_creator: u64,
    pub fee_lp: u64,
    pub fee_minter: u64,
}

#[cfg(feature = "trading-backend-amm")]
#[derive(Clone, Debug, PartialEq, arbitrary::Arbitrary, proptest_derive::Arbitrary)]
pub struct ActionAddLiquidity {
    pub amount: U256,
    pub deadline: U256,
}

#[cfg(feature = "trading-backend-amm")]
#[derive(Clone, Debug, PartialEq, arbitrary::Arbitrary, proptest_derive::Arbitrary)]
pub struct ActionRemoveLiquidity {
    pub amount: U256,
}

#[derive(Clone, Debug, PartialEq, arbitrary::Arbitrary, proptest_derive::Arbitrary)]
pub struct ActionMint {
    pub outcome_id: FixedBytes<8>,
    pub usd_amt: U256,
}

#[cfg(feature = "trading-backend-amm")]
#[derive(Clone, Debug, PartialEq, arbitrary::Arbitrary, proptest_derive::Arbitrary)]
pub struct ActionBurn {
    pub outcome_id: FixedBytes<8>,
    pub usd_amt: U256,
}

#[cfg(feature = "trading-backend-amm")]
#[derive(Clone, Debug, PartialEq, arbitrary::Arbitrary, proptest_derive::Arbitrary)]
pub struct ActionClaimLiquidity {}

#[cfg(feature = "trading-backend-amm")]
#[derive(Clone, Debug, PartialEq, arbitrary::Arbitrary, proptest_derive::Arbitrary)]
pub struct ActionClaimLpFees {}

#[derive(Clone, Debug, PartialEq, arbitrary::Arbitrary, proptest_derive::Arbitrary)]
pub enum Action {
    Ctor(ActionCtor),
    Mint(ActionMint),
    #[cfg(feature = "trading-backend-amm")]
    AddLiquidity(ActionAddLiquidity),
    #[cfg(feature = "trading-backend-amm")]
    RemoveLiquidity(ActionRemoveLiquidity),
    #[cfg(feature = "trading-backend-amm")]
    Burn(ActionBurn),
    #[cfg(feature = "trading-backend-amm")]
    ClaimLiquidity(ActionClaimLiquidity),
    #[cfg(feature = "trading-backend-amm")]
    ClaimLpFees(ActionClaimLpFees),
}

pub fn strat_action() -> BoxedStrategy<Action> {
    prop_oneof![
        any::<ActionCtor>().prop_map(Action::Ctor),
        any::<ActionMint>().prop_map(Action::Mint),
        #[cfg(feature = "trading-backend-amm")]
        any::<ActionAddLiquidity>().prop_map(Action::AddLiquidity),
        #[cfg(feature = "trading-backend-amm")]
        any::<ActionRemoveLiquidity>().prop_map(Action::RemoveLiquidity),
        #[cfg(feature = "trading-backend-amm")]
        any::<ActionBurn>().prop_map(Action::Burn),
        #[cfg(feature = "trading-backend-amm")]
        any::<ActionClaimLiquidity>().prop_map(Action::ClaimLiquidity),
        #[cfg(feature = "trading-backend-amm")]
        any::<ActionClaimLpFees>().prop_map(Action::ClaimLpFees),
    ]
    .boxed()
}
