use crate::{
    error::*,
    events, fusdc_call,
    immutables::*,
    maths, proxy, share_call,
    storage_trading::*,
    utils::{contract_address, msg_sender},
};

use stylus_sdk::{
    alloy_primitives::{aliases::*, *},
    evm,
};

use alloc::vec::Vec;

impl StorageTrading {
    pub fn internal_dppm_ctor(&mut self, outcomes: Vec<FixedBytes<8>>) -> R<()> {
        // We assume that the caller already supplied the liquidity to
        // us, and we set them as the factory.
        let seed_liquidity = U256::from(outcomes.len()) * FUSDC_DECIMALS_EXP;
        self.dppm_global_invested.set(seed_liquidity);
        // Start to go through each outcome, and seed it with its initial amount.
        // And set each slot in the storage with the outcome id for Longtail
        // later.
        for outcome_id in outcomes {
            // This isn't a precaution that we actually need, but there may be weird
            // behaviour with this being possible (ie, payoff before the end date).
            assert_or!(!outcome_id.is_zero(), Error::OutcomeIsZero);
            // We always set this to 1 now.
            self.dppm_out_of.setter(outcome_id).set(SHARE_DECIMALS_EXP);
            self.dppm_outcome_invested
                .setter(outcome_id)
                .set(SHARE_DECIMALS_EXP);
            self.outcome_list.push(outcome_id);
        }
        Ok(())
    }

    #[allow(clippy::too_many_arguments)]
    #[allow(non_snake_case)]
    pub fn internal_dppm_mint(
        &mut self,
        outcome_id: FixedBytes<8>,
        value: U256,
        recipient: Address,
    ) -> R<U256> {
        // Make sure that the outcome exists by checking if we set this up with some shares.
        assert_or!(
            self.dppm_out_of.get(outcome_id) > U256::ZERO,
            Error::NonexistentOutcome
        );
        let outcome_a = self.outcome_list.get(0).unwrap();
        let outcome_b = self.outcome_list.get(1).unwrap();
        let shares = self.internal_calc_dppm_mint(outcome_id, value)?;
        {
            let x = self.dppm_outcome_invested.get(outcome_id);
            self.dppm_outcome_invested
                .setter(outcome_id)
                .set(x.checked_add(shares).ok_or(Error::CheckedAddOverflow)?);
        }
        let outcome_other = if outcome_a == outcome_id {
            outcome_b
        } else {
            outcome_a
        };
        {
            let x = self.dppm_out_of.get(outcome_other);
            self.dppm_out_of.setter(outcome_other).set(
                x.checked_add(
                    shares
                        .checked_sub(value)
                        .ok_or(Error::CheckedSubOverflow(shares, value))?,
                )
                .ok_or(Error::CheckedAddOverflow)?,
            );
        }
        let share_addr = proxy::get_share_addr(
            self.factory_addr.get(),
            contract_address(),
            self.share_impl.get(),
            outcome_id,
        );
        {
            let x = self.dppm_global_invested.get();
            self.dppm_global_invested.set(x + value);
        }
        let t_end = self.time_start.get();
        let half = (self.time_ending.get() - t_end) / U64::from(2);
        let ninetails_shares = maths::ninetails_shares(shares, half, t_end)?;
        {
            let s = self.ninetails_user_boosted_shares.get(recipient);
            self.ninetails_user_boosted_shares.setter(recipient).set(
                s.checked_add(ninetails_shares)
                    .ok_or(Error::CheckedAddOverflow)?,
            );
            let g = self.ninetails_global_boosted_shares.get();
            self.ninetails_global_boosted_shares.set(
                g.checked_add(ninetails_shares)
                    .ok_or(Error::CheckedAddOverflow)?,
            );
        }
        assert_or!(shares > U256::ZERO, Error::UnusualAmountCreated);
        c!(share_call::mint(share_addr, recipient, shares));
        evm::log(events::SharesMinted {
            identifier: outcome_id,
            shareAmount: shares,
            spender: msg_sender(),
            recipient,
            fusdcSpent: value,
        });
        Ok(shares)
    }

    #[allow(non_snake_case)]
    pub fn internal_dppm_payoff(
        &mut self,
        outcome_id: FixedBytes<8>,
        amt: U256,
        recipient: Address,
    ) -> R<U256> {
        assert_or!(self.winner.get() == outcome_id, Error::NotWinner);
        // Get the user's balance of the share they own for this outcome.
        let share_addr = proxy::get_share_addr(
            self.factory_addr.get(),
            contract_address(), // Address of this contract, the Trading contract.
            self.share_impl.get(),
            outcome_id,
        );
        // Start to burn their share of the supply to convert to a payoff amount.
        // Take the max of what they asked.
        let share_bal = U256::min(share_call::balance_of(share_addr, msg_sender())?, amt);
        assert_or!(share_bal > U256::ZERO, Error::ZeroShares);
        share_call::burn(share_addr, msg_sender(), share_bal)?;
        let fusdc = self.internal_dppm_simulate_payoff(outcome_id, share_bal)?;
        evm::log(events::PayoffActivated {
            identifier: outcome_id,
            sharesSpent: share_bal,
            spender: msg_sender(),
            recipient,
            fusdcReceived: fusdc,
        });
        fusdc_call::transfer(recipient, fusdc)?;
        Ok(fusdc)
    }

    #[allow(unused)]
    fn internal_calc_dppm_mint(&self, outcome_id: FixedBytes<8>, value: U256) -> R<U256> {
        #[allow(non_snake_case)]
        let M_A = self.dppm_outcome_invested.get(outcome_id);
        let outcome_b = if outcome_id == self.outcome_list.get(0).unwrap() {
            self.outcome_list.get(1)
        } else {
            self.outcome_list.get(0)
        }
        .unwrap();
        #[allow(non_snake_case)]
        let M_B = self.dppm_outcome_invested.get(outcome_b);
        let out_of_b = self.dppm_out_of.get(outcome_b);
        let shares = maths::dppm_shares(M_A, M_B, value, out_of_b)?;
        let new_dppm_shares = out_of_b
            .checked_sub(shares)
            .ok_or(Error::CheckedSubOverflow(out_of_b, shares))?;
        Ok(shares)
    }

    pub fn internal_dppm_simulate_payoff(
        &self,
        _outcome_id: FixedBytes<8>,
        share_bal: U256,
    ) -> R<U256> {
        maths::dppm_payoff(share_bal)
    }

    pub fn internal_dppm_price(&self, id: FixedBytes<8>) -> R<U256> {
        if self.dppm_outcome_invested.get(id).is_zero() {
            return Ok(U256::ZERO);
        }
        maths::dppm_price(
            self.dppm_outcome_invested.get(id),
            self.dppm_global_invested
                .get()
                .checked_sub(self.dppm_outcome_invested.get(id))
                .ok_or(Error::CheckedSubOverflow(
                    self.dppm_global_invested.get(),
                    self.dppm_outcome_invested.get(id),
                ))?,
        )
    }
}
