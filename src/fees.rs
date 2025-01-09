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

// Share of the incentive amount that we take for Fluidity Labs
// operations.
const INCENTIVE_AMT_MODERATION_INT: u64 = 2000000;
pub const INCENTIVE_AMT_MODERATION: U256 =
    U256::from_limbs([INCENTIVE_AMT_MODERATION_INT, 0, 0, 0]);

// Share of the amount for activating the call function for the first
// time.
const INCENTIVE_AMT_CALL_INT: u64 = 600000;
pub const INCENTIVE_AMT_CALL: U256 = U256::from_limbs([INCENTIVE_AMT_CALL_INT, 0, 0, 0]);

// Share of the amount for calling the close function after someone has
// called and the whinge period has ended.
const INCENTIVE_AMT_CLOSE_INT: u64 = 100000;
pub const INCENTIVE_AMT_CLOSE: U256 = U256::from_limbs([INCENTIVE_AMT_CLOSE_INT, 0, 0, 0]);

// Amount that's sent to incentive callers of the declare function.
const INCENTIVE_AMT_DECLARE_INT: u64 = 300000;
pub const INCENTIVE_AMT_DECLARE: U256 = U256::from_limbs([INCENTIVE_AMT_DECLARE_INT, 0, 0, 0]);

// Amount that we take as bond for calling. $2 fUSDC.
pub const BOND_FOR_CALL: U256 = U256::from_limbs([2e6 as u64, 0, 0, 0]);

// Amount that we take as bond for whinging. $7 fUSDC.
pub const BOND_FOR_WHINGE: U256 = U256::from_limbs([7e6 as u64, 0, 0, 0]);
