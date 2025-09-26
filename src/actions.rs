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
    pub should_estimate_share_burn: bool,
}

#[cfg(feature = "trading-backend-amm")]
#[derive(Clone, Debug, PartialEq, P, A)]
pub struct ActionClaimAllFees {}

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
    ClaimAllFees(ActionClaimAllFees),
}

pub fn strat_action() -> BoxedStrategy<Action> {
    #[cfg(feature = "trading-backend-amm")]
    return prop_oneof![
        any::<ActionCtor>().prop_map(Action::Ctor),
        any::<ActionMint>().prop_map(Action::Mint),
        any::<ActionAddLiquidity>().prop_map(Action::AddLiquidity),
        any::<ActionRemoveLiquidity>().prop_map(Action::RemoveLiquidity),
        any::<ActionBurn>().prop_map(Action::Burn),
        any::<ActionClaimAllFees>().prop_map(Action::ClaimAllFees),
    ]
    .boxed();
    #[cfg(not(feature = "trading-backend-amm"))]
    return prop_oneof![
        any::<ActionCtor>().prop_map(Action::Ctor),
        any::<ActionMint>().prop_map(Action::Mint),
    ]
    .boxed();
}

#[derive(Debug, Clone, PartialEq)]
pub struct ActionEffect {
    pub shares_received: Vec<(FixedBytes<8>, U256)>,
    pub fusdc_received: U256,
    pub fusdc_spent: U256,
    pub outcome_winner: Option<FixedBytes<8>>,
}

#[cfg(feature = "trading-backend-amm")]
pub fn strat_tiny_mint_into_burn(
    outcomes: Vec<FixedBytes<8>>,
    referrers: Vec<Address>,
) -> impl Strategy<Value = [Action; 2]> {
    // Create some outcomes in the range we want, then map over that to
    // create a series of either tiny mint into burn strategies, add and
    // remove liquidity strategies, then eventually a payoff at the end. We
    // can do this to test if the contract ever runs a deficit.
    let refs1 = referrers.clone();
    let refs2 = referrers.clone();
    (0..outcomes.len(), 0..refs1.len(), any::<u32>())
        .prop_flat_map(move |(oi, ri_m, m)| {
            let out = outcomes[oi];
            let rm = refs1[ri_m];
            let m_u = U256::from(m);
            (Just((out, rm, m_u)), 0..refs1.len(), 0..=m)
        })
        .prop_map(move |((out, rm, m_u), ri_b, b)| {
            [
                Action::Mint(ActionMint {
                    outcome: out,
                    referrer: rm,
                    usd_amt: m_u,
                }),
                Action::Burn(ActionBurn {
                    outcome: out,
                    referrer: refs2[ri_b],
                    should_estimate_share_burn: false,
                    usd_amt: U256::from(b),
                }),
            ]
        })
}

#[cfg(feature = "trading-backend-amm")]
pub fn strat_tiny_mint_into_burn_outcomes(
    max_outcomes: usize,
    max_referrers: usize,
    lower: usize,
    upper: usize,
) -> impl Strategy<Value = (Vec<FixedBytes<8>>, Vec<Address>, Vec<[Action; 2]>)> {
    use proptest::collection::vec;
    (
        strat_uniq_outcomes(2, max_outcomes),
        vec(any::<Address>(), 2..=max_referrers),
    )
        .prop_flat_map(move |(outs, refs)| {
            let outs2 = outs.clone();
            let refs2 = refs.clone();
            vec(strat_tiny_mint_into_burn(outs2, refs2), lower..=upper)
                .prop_map(move |acts| (outs.clone(), refs.clone(), acts))
        })
}

/*
#[cfg(feature = "trading-backend-amm")]
pub fn strat_reasonable_actions(
    max_outcomes: usize,
    max_referrers: usize,
    lower: usize,
    upper: usize,
) -> impl Strategy<Value = (Vec<FixedBytes<8>>, Vec<Address>, Vec<Action>)> {
    use proptest::collection::vec;
    // Create some outcomes in the range we want, then map over that to
    // create a series of either tiny mint into burn strategies, add and
    // remove liquidity strategies, then eventually a payoff at the end. We
    // can do this to test if the contract ever runs a deficit.
    (
        strat_uniq_outcomes(2, max_outcomes),
        vec(any::<Address>(), 0..=max_referrers),
    )
        .prop_flat_map(move |(outs, refs)| {
            let outs2 = outs.clone();
            let refs2 = refs.clone();
            vec(strat_tiny_mint_into_burn(&outs2, &refs2), lower..=upper).prop_map(
                move |pairs: Vec<[Action; 2]>| {
                    let actions = pairs.into_iter().flat_map(|arr| arr).collect::<Vec<_>>();
                    (outs2.clone(), refs2.clone(), actions)
                },
            )
        })
}
*/

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
                    $c.mint_8_A_059_B_6_E(a.outcome, a.usd_amt, a.referrer, $sender,)
                );
            }
            #[cfg(feature = "trading-backend-amm")]
            Action::AddLiquidity(a) => {
                should_spend_fusdc_sender!(
                    a.amount,
                    $c.add_liquidity_638_E_B_2_C_9(a.amount, $sender, U256::ZERO)
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
                    $c.burn_854_C_C_96_E(
                        a.outcome,
                        a.usd_amt,
                        a.should_estimate_share_burn,
                        U256::ZERO,
                        a.referrer,
                        $sender
                    )
                );
            }
            #[cfg(feature = "trading-backend-amm")]
            Action::ClaimAllFees(a) => {
                $c.claim_all_fees_332_D_7968($sender).unwrap();
            }
        };
    }};
}
