use stylus_sdk::alloy_primitives::U256;

// Scaling that's done before for any fees taken from the incentive amount, or
// the mint fee amount.
pub const FEE_SCALING: U256 = U256::from_limbs([100, 0, 0, 0]);

// 5% of all trading to buy shares goes to the creator of the contract.
pub const FEE_MINT_PCT: U256 = U256::from_limbs([5, 0, 0, 0]);

/*
Base Amount: 100% (10 FUSDC)
    - Moderation: 10%  (1 FUSDC)
    - Call: 20%      (2 FUSDC)
    - Close: 10%     (1 FUSDC)
    - Sweep: 50%     (5 FUSDC)
*/

// Incentive amount to take from users who create markets. $10 FUSDC.
pub const INCENTIVE_AMT_BASE: U256 = U256::from_limbs([1e7 as u64, 0, 0, 0]);

// Share of the incentive amount that we take for Fluidity Labs
// operations (10% of incentive amount base).
pub const INCENTIVE_AMT_MODERATION: U256 = U256::from_limbs([1e6 as u64, 0, 0, 0]);

// Share of the amount for activating the call function for the first
// time (20% of the base incentive amount).
pub const INCENTIVE_AMT_CALL: U256 = U256::from_limbs([2000000 as u64, 0, 0, 0]);

// Share of the amount for calling the close function after someone has
// called and the whinge period has ended.
pub const INCENTIVE_AMT_CLOSE: U256 = U256::from_limbs([1e6 as u64, 0, 0, 0]);

// Amount that's sent to incentive callers of the sweep function (50% of
// the incentive amount base).
pub const INCENTIVE_AMT_SWEEP: U256 = U256::from_limbs([5000000, 0, 0, 0]);

// Amount that we take as bond for whinging. $10 fUSDC.
pub const BOND_FOR_WHINGE: U256 = U256::from_limbs([1e7 as u64, 0, 0, 0]);
