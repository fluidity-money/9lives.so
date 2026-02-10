use stylus_sdk::alloy_primitives::{aliases::*, *};

use crate::{
    error::*,
    fusdc_call,
    immutables::{CLAIMANT_HELPER, DAO_OP_ADDR},
    maths,
    utils::{block_timestamp, contract_address, msg_sender},
};

pub use crate::storage_trading::*;

#[cfg(feature = "contract-trading-quotes")]
use alloc::vec::Vec;

#[cfg_attr(feature = "contract-trading-quotes", stylus_sdk::prelude::public)]
impl StorageTrading {
    // Quote the amount of shares purchased, and the fees taken.
    #[allow(non_snake_case)]
    pub fn quote_C_0_E_17_F_C_7(
        &self,
        outcome_id: FixedBytes<8>,
        value: U256,
    ) -> R<(U256, U256, U256)> {
        if !self.when_decided.get().is_zero() {
            return Ok((U256::ZERO, U256::ZERO, U256::ZERO));
        }
        let (fee, _) = self.calculate_fees(value, true)?;
        let value = value
            .checked_sub(fee)
            .ok_or(Error::CheckedSubOverflow(value, fee))?;
        #[cfg(feature = "trading-backend-dppm")]
        return {
            let (dppm_shares, boosted_shares) = self.internal_dppm_quote(outcome_id, value)?;
            Ok((dppm_shares, fee, boosted_shares))
        };
        #[cfg(not(feature = "trading-backend-dppm"))]
        return Ok((
            self.internal_amm_quote_mint(outcome_id, value)?,
            fee,
            U256::ZERO,
        ));
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
        let spender = match msg_sender() {
            CLAIMANT_HELPER => recipient,
            s => s,
        };
        #[cfg(feature = "trading-backend-dppm")]
        return self.internal_dppm_payoff(spender, outcome_id, amt, recipient);
        #[cfg(not(feature = "trading-backend-dppm"))]
        return self.internal_amm_payoff(spender, outcome_id, amt, recipient);
    }

    #[allow(non_snake_case)]
    pub fn dppm_payoff_for_all_58633_B_6_E(&mut self, _recipient: Address) -> R<(U256, U256)> {
        #[cfg(feature = "trading-backend-dppm")]
        return {
            let s = match msg_sender() {
                CLAIMANT_HELPER => _recipient,
                s => s,
            };
            Ok((
                self.internal_dppm_payoff(
                    s,
                    self.outcome_list.get(0).unwrap(),
                    U256::MAX,
                    _recipient,
                )?,
                self.internal_dppm_payoff(
                    s,
                    self.outcome_list.get(1).unwrap(),
                    U256::MAX,
                    _recipient,
                )?,
            ))
        };
        #[cfg(not(feature = "trading-backend-dppm"))]
        unimplemented!()
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
    pub fn rescue_55307_4_E_7(&self, amt: U256, recipient: Address) -> R<U256> {
        assert_or!(msg_sender() == DAO_OP_ADDR, Error::NotOperator);
        fusdc_call::transfer(recipient, amt)?;
        Ok(amt)
    }

    #[allow(non_snake_case)]
    pub fn dppm_simulate_earnings_B_866_B_112(
        &self,
        _invested: U256,
        _outcome: FixedBytes<8>,
    ) -> R<(U256, U256, U256)> {
        #[cfg(not(feature = "trading-backend-dppm"))]
        unimplemented!();
        #[cfg(feature = "trading-backend-dppm")]
        {
            if _invested.is_zero() {
                return Ok((U256::ZERO, U256::ZERO, U256::ZERO));
            }
            let (dppm_shares, ninetails_shares) =
                self.internal_dppm_simulate_mint(_outcome, _invested)?;
            let (fusdc_dppm, fusdc_winning_ninetails) = self.internal_dppm_simulate_payoff_state(
                dppm_shares,
                ninetails_shares,
                _outcome,
                _invested,
                dppm_shares,
                ninetails_shares,
            )?;
            let o_1 = self.outcome_list.get(0).unwrap();
            let winning_outcome_shares = self.dppm_shares_outcome.get(if o_1 == _outcome {
                self.outcome_list.get(1).unwrap()
            } else {
                o_1
            });
            let fusdc_losing_ninetails = self.internal_dppm_simulate_loser_payoff(
                ninetails_shares,
                winning_outcome_shares,
                _invested,
                ninetails_shares,
            )?;
            Ok((fusdc_dppm, fusdc_winning_ninetails, fusdc_losing_ninetails))
        }
    }
}

impl StorageTrading {
    #[allow(unused)]
    #[mutants::skip]
    fn internal_dppm_quote(&self, outcome_id: FixedBytes<8>, value: U256) -> R<(U256, U256)> {
        assert_or!(
            self.dppm_outcome_invested.get(outcome_id) > U256::ZERO,
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
        let t_start = self.time_start.get();
        let t_end = self.time_ending.get() - self.time_start.get();
        let t_now = U64::from(block_timestamp());
        // current time - start time for the market
        let t_buy = t_now
            .checked_sub(t_start)
            .ok_or(Error::CheckedSubOverflow64(t_now, t_start))?;
        let dppm_shares = maths::dppm_shares(
            self.dppm_outcome_invested.get(outcome_id),
            self.dppm_global_invested.get() - self.dppm_outcome_invested.get(outcome_id),
            value,
            out_of_other,
        )?;
        Ok((
            dppm_shares,
            maths::ninetails_shares(dppm_shares, t_buy, t_end)?,
        ))
    }
}
