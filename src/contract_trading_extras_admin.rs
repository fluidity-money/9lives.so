// This exports user_entrypoint, which we need to have the entrypoint code.
pub use crate::{
    error::*,
    immutables::DAO_OP_ADDR,
    storage_trading::*,
    trading_call,
    utils::{contract_address, msg_sender},
};

use stylus_sdk::alloy_primitives::*;

#[allow(unused)]
use alloc::vec::Vec;

#[cfg_attr(feature = "contract-trading-extras-admin", stylus_sdk::prelude::public)]
impl StorageTrading {
    // Shift drains what the team considers "junk" liquidity (a poorly
    // made market that slipped through the cracks) during a promotion
    // and sends it as liquidity to another market. It should be used
    // with an excessive amounts of caution and communication. It
    // will not liquidate any shares that the user would otherwise have
    // received, making it inappropriate to be used in any circumstance
    // other than a user has created a junk campaign with seed liquidity
    // that we want to redistribute.
    pub fn shift(&mut self, _user: Address, _target: Address) -> R<U256> {
        #[cfg(feature = "trading-backend-dpm")]
        unimplemented!();
        #[cfg(not(feature = "trading-backend-dpm"))]
        {
            assert_or!(msg_sender() == DAO_OP_ADDR, Error::NotOperator);
            let (fusdc_amt, _, _) = self.internal_amm_remove_liquidity(
                self.amm_user_liquidity_shares.get(_user),
                contract_address(),
            )?;
            // The caller will need to be mindful of the action and liquidity that's
            // in this market.
            return trading_call::add_liquidity(_target, fusdc_amt, _user, U256::ZERO);
        }
    }
}
