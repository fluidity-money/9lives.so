use stylus_sdk::alloy_primitives::U256;

// Scaling that's done before for any fees taken from the incentive amount, or
// the mint fee amount.
pub const FEE_SCALING: U256 = U256::from_limbs([100, 0, 0, 0]);

// 5% of all trading to buy shares goes to the creator of the contract.
pub const FEE_CREATOR_MINT_PCT: U256 = U256::from_limbs([5, 0, 0, 0]);

// 2% of all trading to buy shares goes to SPN.
pub const FEE_SPN_MINT_PCT: U256 = U256::from_limbs([2, 0, 0, 0]);

// 2% of all pot amounts liquidated go to the caller of the function that
// transitions their amounts over.
pub const FEE_POT_INFRA_PCT: U256 = U256::from_limbs([2, 0, 0, 0]);

// 2% of all confiscation fees go to the caller of the sweep function if
// they differ from the recipient.
pub const FEE_OTHER_CALLER_CONFISCATE_PCT: U256 = U256::from_limbs([2, 0, 0, 0]);

/*
Base Amount:      100% (3 FUSDC)
    - Moderation: 75%  (2 FUSDC)
    - Call:       20%  (0.6 FUSDC)
    - Close:      10%  (0.1 FUSDC)
    - Sweep:      50%  (0.3 FUSDC)
*/

// Incentive amount to take from users who create markets (for the infra
// market). $3 fUSDC.
pub const INCENTIVE_AMT_BASE: U256 = U256::from_limbs([3000000, 0, 0, 0]);

// Share of the incentive amount that we take for Fluidity Labs
// operations.
pub const INCENTIVE_AMT_MODERATION: U256 = U256::from_limbs([2000000, 0, 0, 0]);

// Share of the amount for activating the call function for the first
// time.
pub const INCENTIVE_AMT_CALL: U256 = U256::from_limbs([600000, 0, 0, 0]);

// Share of the amount for calling the close function after someone has
// called and the whinge period has ended.
pub const INCENTIVE_AMT_CLOSE: U256 = U256::from_limbs([100000, 0, 0, 0]);

// Amount that's sent to incentive callers of the sweep function.
pub const INCENTIVE_AMT_SWEEP: U256 = U256::from_limbs([300000, 0, 0, 0]);

// Amount that we take as bond for calling. $2 fUSDC.
pub const BOND_FOR_CALL: U256 = U256::from_limbs([2e6 as u64, 0, 0, 0]);

// Amount that we take as bond for whinging. $7 fUSDC.
pub const BOND_FOR_WHINGE: U256 = U256::from_limbs([7e6 as u64, 0, 0, 0]);
