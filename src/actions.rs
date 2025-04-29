use stylus_sdk::alloy_primitives::{Address, FixedBytes, U256};

use proptest::{prelude::*, prop_oneof};

use proptest_derive::Arbitrary as P;

use arbitrary::Arbitrary as A;

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
    pub fee_referrer: u64,
}

#[cfg(feature = "trading-backend-amm")]
#[derive(Clone, Debug, PartialEq, P, A)]
pub struct ActionAddLiquidity {
    pub amount: U256,
}

#[cfg(feature = "trading-backend-amm")]
#[derive(Clone, Debug, PartialEq, P, A)]
pub struct ActionRemoveLiquidity {
    pub amount: U256,
}

#[derive(Clone, Debug, PartialEq, P, A)]
pub struct ActionMint {
    pub outcome: FixedBytes<8>,
    pub referrer: Address,
    pub usd_amt: U256,
}

#[cfg(feature = "trading-backend-amm")]
#[derive(Clone, Debug, PartialEq, P, A)]
pub struct ActionBurn {
    pub outcome: FixedBytes<8>,
    pub referrer: Address,
    pub usd_amt: U256,
}

#[cfg(feature = "trading-backend-amm")]
#[derive(Clone, Debug, PartialEq, P, A)]
pub struct ActionClaimLiquidity {}

#[cfg(feature = "trading-backend-amm")]
#[derive(Clone, Debug, PartialEq, P, A)]
pub struct ActionClaimLpFees {}

#[derive(Clone, Debug, PartialEq, P, A)]
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

#[derive(Debug, Clone, PartialEq)]
pub struct ActionEffect {
    pub shares_received: Vec<(FixedBytes<8>, U256)>,
    pub fusdc_received: U256,
    pub fusdc_spent: U256,
    pub outcome_winner: Option<FixedBytes<8>>,
}

// TODO: translate this into a structured return type with the effect of the below.
#[macro_export]
macro_rules! implement_action {
    ($c:expr, $sender:expr, $action:expr) => {{
        use stylus_sdk::alloy_primitives::U256;
        use $crate::{actions::Action, should_spend_fusdc_sender};
        match $action {
            Action::Ctor(a) => {
                $c.ctor((
                    a.outcomes,
                    a.oracle,
                    a.time_start,
                    a.time_ending,
                    a.fee_recipient,
                    a.share_impl,
                    a.should_buffer_time,
                    a.fee_creator,
                    a.fee_lp,
                    a.fee_minter,
                    a.fee_referrer,
                ))
                .unwrap();
            }
            Action::Mint(a) => {
                should_spend_fusdc_sender!(
                    a.usd_amt,
                    $c.mint_permit_243_E_E_C_56(
                        a.outcome,
                        a.usd_amt,
                        a.referrer,
                        $sender,
                        U256::ZERO,
                        0,
                        FixedBytes::<32>::ZERO,
                        FixedBytes::<32>::ZERO,
                    )
                );
            }
            #[cfg(feature = "trading-backend-amm")]
            Action::AddLiquidity(a) => {
                should_spend_fusdc_sender!(
                    a.amount,
                    $c.add_liquidity_permit(
                        a.amount,
                        $sender,
                        U256::ZERO,
                        0,
                        FixedBytes::<32>::ZERO,
                        FixedBytes::<32>::ZERO,
                    )
                );
            }
            #[cfg(feature = "trading-backend-amm")]
            Action::RemoveLiquidity(a) => {
                should_spend_fusdc_sender!(
                    a.amount,
                    $c.remove_liquidity_3_C_857_A_15(a.amount, $sender)
                );
            }
            #[cfg(feature = "trading-backend-amm")]
            Action::Burn(a) => {
                should_spend_fusdc_sender!(
                    a.usd_amt,
                    $c.burn_9_C_54_A_443(a.outcome, a.usd_amt, U256::ZERO, a.referrer, $sender)
                );
            }
            #[cfg(feature = "trading-backend-amm")]
            Action::ClaimLiquidity(a) => {
                $c.claim_liquidity_9_C_391_F_85($sender).unwrap();
            }
            #[cfg(feature = "trading-backend-amm")]
            Action::ClaimLpFees(a) => {
                $c.claim_lp_fees_66980_F_36($sender).unwrap();
            }
        };
    }};
}
