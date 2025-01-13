use stylus_sdk::alloy_primitives::U256;

// Scaling that's done before for any fees taken from the incentive amount, or
// the mint fee amount.
pub const FEE_SCALING: U256 = U256::from_limbs([1000, 0, 0, 0]);

// 0.2% of all trading to buy shares goes to the creator of the contract.
pub const FEE_CREATOR_MINT_PCT: U256 = U256::from_limbs([2, 0, 0, 0]);

// 0.8% of all trading to buy shares goes to SPN.
pub const FEE_SPN_MINT_PCT: U256 = U256::from_limbs([8, 0, 0, 0]);

// 2% of all pot amounts liquidated go to the caller of the function that
// transitions their amounts over.
pub const FEE_POT_INFRA_PCT: U256 = U256::from_limbs([20, 0, 0, 0]);

/*
- Moderation: 1   FUSDC
- Call:       1   FUSDC
- Close:      0.1 FUSDC
- Declare:    0.1 FUSDC
*/

// Share of the incentive amount that we take for Fluidity Labs
// operations ($1)
const INCENTIVE_AMT_MODERATION_INT: u64 = 1e6 as u64;
pub const INCENTIVE_AMT_MODERATION: U256 =
    U256::from_limbs([INCENTIVE_AMT_MODERATION_INT, 0, 0, 0]);

// Share of the amount for activating the call function for the first
// time ($1)
const INCENTIVE_AMT_CALL_INT: u64 = 1e6 as u64;
pub const INCENTIVE_AMT_CALL: U256 = U256::from_limbs([INCENTIVE_AMT_CALL_INT, 0, 0, 0]);

// Share of the amount for calling the close function after someone has
// called and the whinge period has ended ($0.1).
const INCENTIVE_AMT_CLOSE_INT: u64 = 1e5 as u64;
pub const INCENTIVE_AMT_CLOSE: U256 = U256::from_limbs([INCENTIVE_AMT_CLOSE_INT, 0, 0, 0]);

// Amount that's sent to incentive callers of the declare function ($0.1).
const INCENTIVE_AMT_DECLARE_INT: u64 = 1e5 as u64;
pub const INCENTIVE_AMT_DECLARE: U256 = U256::from_limbs([INCENTIVE_AMT_DECLARE_INT, 0, 0, 0]);

// Amount that we take as bond for calling. $2 fUSDC.
pub const BOND_FOR_CALL: U256 = U256::from_limbs([2e6 as u64, 0, 0, 0]);

// Amount that we take as bond for whinging. $7 fUSDC.
pub const BOND_FOR_WHINGE: U256 = U256::from_limbs([7e6 as u64, 0, 0, 0]);
