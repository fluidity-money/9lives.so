use stylus_sdk::alloy_primitives::{aliases::*, *};

use crate::{
    error::*,
    fusdc_call,
    immutables::DAO_OP_ADDR,
    maths,
    utils::{contract_address, msg_sender},
};

pub use crate::storage_trading::*;

#[cfg(feature = "contract-trading-quotes")]
use alloc::vec::Vec;

#[cfg_attr(feature = "contract-trading-quotes", stylus_sdk::prelude::public)]
impl StorageTrading {
    // Quote the amount of shares purchased, and the fees taken.
    #[allow(non_snake_case)]
    pub fn quote_C_0_E_17_F_C_7(&self, outcome_id: FixedBytes<8>, value: U256) -> R<(U256, U256)> {
        if !self.when_decided.get().is_zero() {
            return Ok((U256::ZERO, U256::ZERO));
        }
        let (fee, _) = self.calculate_fees(value, true)?;
        let value = value
            .checked_sub(fee)
            .ok_or(Error::CheckedSubOverflow(value, fee))?;
        #[cfg(feature = "trading-backend-dppm")]
        return Ok((self.internal_dppm_quote(outcome_id, value)?, fee));
        #[cfg(not(feature = "trading-backend-dppm"))]
        return Ok((self.internal_amm_quote_mint(outcome_id, value)?, fee));
    }

    /// Quote the amount of shares that would be received for burning the
    /// fUSDC amount given. Inclusive of fees.
    #[allow(non_snake_case)]
    pub fn estimate_burn_E_9_B_09_A_17(&self, _outcome_id: FixedBytes<8>, _value: U256) -> R<U256> {
        if !self.when_decided.get().is_zero() {
            return Ok(U256::ZERO);
        }
        #[cfg(feature = "trading-backend-dppm")]
        return Err(Error::AMMOnly);
        #[cfg(not(feature = "trading-backend-dppm"))]
        return self.internal_amm_estimate_burn(_outcome_id, _value);
    }

    #[allow(non_snake_case)]
    pub fn payoff_C_B_6_F_2565(
        &mut self,
        outcome_id: FixedBytes<8>,
        amt: U256,
        recipient: Address,
    ) -> R<U256> {
        #[cfg(feature = "trading-backend-dppm")]
        return self.internal_dppm_payoff(outcome_id, amt, recipient);
        #[cfg(not(feature = "trading-backend-dppm"))]
        return self.internal_amm_payoff(outcome_id, amt, recipient);
    }

    #[allow(non_snake_case)]
    pub fn fees_62_D_A_A_154(&self) -> R<(U256, U256, U256, U256)> {
        #[cfg(feature = "trading-backend-amm")]
        let fee_lp = self.fee_lp.get();
        #[cfg(not(feature = "trading-backend-amm"))]
        let fee_lp = U256::ZERO;
        Ok((
            self.fee_creator.get(),
            self.fee_minter.get(),
            fee_lp,
            self.fee_referrer.get(),
        ))
    }

    #[allow(non_snake_case)]
    pub fn rescue_2_7_6_D_D_9_A_B(&self, recipient: Address) -> R<U256> {
        // The point of this function is that while we don't have upgrade powers,
        // we can rescue any funds if something goes wrong during our first batch
        // of usage.
        assert_or!(msg_sender() == DAO_OP_ADDR, Error::NotOperator);
        let bal = fusdc_call::balance_of(contract_address())?;
        fusdc_call::transfer(recipient, bal)?;
        Ok(bal)
    }
}

impl StorageTrading {
    #[allow(unused)]
    #[mutants::skip]
    fn internal_dppm_quote(&self, outcome_id: FixedBytes<8>, value: U256) -> R<U256> {
        assert_or!(
            self.dppm_out_of.get(outcome_id) > U256::ZERO,
            Error::NonexistentOutcome
        );
        let out_of_other = self.dppm_out_of.get(
            if outcome_id == self.outcome_list.get(0).unwrap() {
                self.outcome_list.get(1)
            } else {
                self.outcome_list.get(0)
            }
            .unwrap(),
        );
        maths::dppm_shares(
            self.dppm_outcome_invested.get(outcome_id),
            self.dppm_global_invested.get() - self.dppm_outcome_invested.get(outcome_id),
            value,
            out_of_other,
        )
    }
}
