use crate::{
    error::*,
    events, fusdc_call,
    immutables::*,
    maths, proxy, share_call,
    storage_trading::*,
    utils::{block_timestamp, contract_address, msg_sender},
};

use stylus_sdk::{
    alloy_primitives::{aliases::*, *},
    evm,
};

use alloc::vec::Vec;

impl StorageTrading {
    pub fn internal_dppm_ctor(&mut self, outcomes: Vec<FixedBytes<8>>) -> R<()> {
        assert_or!(outcomes.len() == 2, Error::BadTradingCtor);
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
            self.dppm_outcome_invested
                .setter(outcome_id)
                .set(SHARE_DECIMALS_EXP);
            self.outcome_list.push(outcome_id);
        }
        Ok(())
    }

    #[allow(clippy::too_many_arguments)]
    #[allow(non_snake_case)]
    pub fn internal_dppm_simulate_mint(
        &self,
        outcome_id: FixedBytes<8>,
        value: U256,
    ) -> R<(U256, U256)> {
        let shares = self.internal_calc_dppm_mint(outcome_id, value)?;
        let t_start = self.time_start.get();
        let t_end = self.time_ending.get() - self.time_start.get();
        let t_now = U64::from(block_timestamp());
        // current time - start time for the market
        let t_buy = t_now
            .checked_sub(t_start)
            .ok_or(Error::CheckedSubOverflow64(t_now, t_start))?;
        let ninetails_shares = maths::ninetails_shares(shares, t_buy, t_end)?;
        assert_or!(shares > U256::ZERO, Error::UnusualAmountCreated);
        Ok((shares, ninetails_shares))
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
            self.dppm_outcome_invested.get(outcome_id) > U256::ZERO,
            Error::NonexistentOutcome
        );
        self.dppm_clawback_impossible.set(true);
        let outcome_a = self.outcome_list.get(0).unwrap();
        let outcome_b = self.outcome_list.get(1).unwrap();
        let shares = self.internal_calc_dppm_mint(outcome_id, value)?;
        {
            let x = self.dppm_outcome_invested.get(outcome_id);
            self.dppm_outcome_invested
                .setter(outcome_id)
                .set(x.checked_add(value).ok_or(Error::CheckedAddOverflow)?);
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
        let t_start = self.time_start.get();
        let t_end = self.time_ending.get() - self.time_start.get();
        let t_now = U64::from(block_timestamp());
        // current time - start time for the market
        let t_buy = t_now
            .checked_sub(t_start)
            .ok_or(Error::CheckedSubOverflow64(t_now, t_start))?;
        let ninetails_shares = maths::ninetails_shares(shares, t_buy, t_end)?;
        {
            let s = self
                .ninetails_user_boosted_shares
                .get(recipient)
                .get(outcome_id);
            self.ninetails_user_boosted_shares
                .setter(recipient)
                .setter(outcome_id)
                .set(
                    s.checked_add(ninetails_shares)
                        .ok_or(Error::CheckedAddOverflow)?,
                );
            let g = self.ninetails_outcome_boosted_shares.get(outcome_id);
            self.ninetails_outcome_boosted_shares
                .setter(outcome_id)
                .set(
                    g.checked_add(ninetails_shares)
                        .ok_or(Error::CheckedAddOverflow)?,
                );
            let g = self.ninetails_global_boosted_shares.get();
            self.ninetails_global_boosted_shares.set(
                g.checked_add(ninetails_shares)
                    .ok_or(Error::CheckedAddOverflow)?,
            );
        }
        assert_or!(shares > U256::ZERO, Error::UnusualAmountCreated);
        {
            let x = self.dppm_shares_outcome.get(outcome_id);
            self.dppm_shares_outcome
                .setter(outcome_id)
                .set(x.checked_add(shares).ok_or(Error::CheckedAddOverflow)?);
        }
        share_call::mint(share_addr, recipient, shares)?;
        evm::log(events::SharesMinted {
            identifier: outcome_id,
            shareAmount: shares,
            spender: msg_sender(),
            recipient,
            fusdcSpent: value,
        });
        evm::log(events::NinetailsBoostedSharesReceived {
            spender: msg_sender(),
            recipient,
            amountReceived: ninetails_shares,
            outcome: outcome_id,
        });
        Ok(shares)
    }

    #[allow(non_snake_case)]
    pub fn internal_dppm_payoff_loser(
        &mut self,
        outcome_id: FixedBytes<8>,
        recipient: Address,
    ) -> R<U256> {
        if self
            .ninetails_user_boosted_shares
            .getter(msg_sender())
            .get(outcome_id)
            .is_zero()
        {
            return Ok(U256::ZERO);
        }
        let shares = self
            .ninetails_user_boosted_shares
            .getter(msg_sender())
            .get(outcome_id);
        let winning_outcome_shares = self.dppm_shares_outcome.get(self.winner.get());
        let fusdc = self.internal_dppm_simulate_loser_payoff(shares, winning_outcome_shares)?;
        self.ninetails_user_boosted_shares
            .setter(msg_sender())
            .setter(outcome_id)
            .set(U256::ZERO);
        evm::log(events::NinetailsLoserPayoff {
            spender: msg_sender(),
            recipient,
            sharesSpent: shares,
            fusdcReceived: fusdc,
            outcome: outcome_id,
        });
        fusdc_call::transfer(recipient, fusdc)?;
        Ok(fusdc)
    }

    #[allow(non_snake_case)]
    pub fn internal_dppm_payoff_winner(
        &mut self,
        outcome_id: FixedBytes<8>,
        amt: U256,
        recipient: Address,
    ) -> R<U256> {
        // Get the user's balance of the share they own for this outcome.
        let share_addr = proxy::get_share_addr(
            self.factory_addr.get(),
            contract_address(), // Address of this contract, the Trading contract.
            self.share_impl.get(),
            outcome_id,
        );
        // Start to burn their share of the supply to convert to a payoff amount.
        // If the user gave us U256::MAX, we'll sell everything they have:
        assert_or!(amt > U256::ZERO, Error::ZeroShares);
        let amt = if amt == U256::MAX {
            share_call::balance_of(share_addr, msg_sender())?
        } else {
            amt
        };
        share_call::burn(share_addr, msg_sender(), amt)?;
        let user_boosted_shares = self
            .ninetails_user_boosted_shares
            .get(msg_sender())
            .get(outcome_id);
        let outcome_boosted_shares = self.ninetails_outcome_boosted_shares.get(outcome_id);
        let all_boosted_shares = self.ninetails_global_boosted_shares.get();
        let outcome_1 = self.outcome_list.get(0).unwrap();
        let outcome_2 = self.outcome_list.get(1).unwrap();
        let M1 = self.dppm_outcome_invested.get(outcome_1);
        let M2 = self.dppm_outcome_invested.get(outcome_2);
        let winning_dppm_shares = self.dppm_shares_outcome.get(outcome_id);
        let (dppm_fusdc, ninetails_fusdc, _) = self.internal_dppm_simulate_payoff(
            amt,
            user_boosted_shares,
            outcome_boosted_shares,
            all_boosted_shares,
            M1,
            M2,
            winning_dppm_shares,
        )?;
        evm::log(events::PayoffActivated {
            identifier: outcome_id,
            sharesSpent: amt,
            spender: msg_sender(),
            recipient,
            fusdcReceived: dppm_fusdc,
        });
        evm::log(events::NinetailsCumulativeWinnerPayoff {
            outcome: outcome_id,
            sharesSpent: user_boosted_shares,
            spender: msg_sender(),
            recipient,
            fusdcReceived: ninetails_fusdc,
        });
        self.ninetails_user_boosted_shares
            .setter(msg_sender())
            .setter(outcome_id)
            .set(U256::ZERO);
        let fusdc = dppm_fusdc
            .checked_add(ninetails_fusdc)
            .ok_or(Error::CheckedAddOverflow)?;
        fusdc_call::transfer(recipient, fusdc)?;
        Ok(fusdc)
    }

    pub fn internal_dppm_payoff(
        &mut self,
        outcome_id: FixedBytes<8>,
        amt: U256,
        recipient: Address,
    ) -> R<U256> {
        assert_or!(!self.when_decided.get().is_zero(), Error::NotDecided);
        if self.winner.get() == outcome_id {
            self.internal_dppm_payoff_winner(outcome_id, amt, recipient)
        } else {
            assert_or!(amt.is_zero(), Error::ZeroSharesMustBeProvidedForLoser);
            self.internal_dppm_payoff_loser(outcome_id, recipient)
        }
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
        Ok(shares)
    }

    /// Estimate the payoff for the simulated amount, returning the fUSDC the
    /// user would win, the amount the user would win if they won, and what
    /// they would win if they lost.
    #[allow(non_snake_case)]
    pub fn internal_dppm_simulate_payoff(
        &self,
        share_bal: U256,
        user_boosted_shares: U256,
        outcome_boosted_shares: U256,
        all_boosted_shares: U256,
        M1: U256,
        M2: U256,
        global_dppm_shares_outcome: U256,
    ) -> R<(U256, U256, U256)> {
        let M = M1.checked_add(M2).ok_or(Error::CheckedAddOverflow)?;
        let leftovers = M
            .checked_sub(global_dppm_shares_outcome)
            .ok_or(Error::CheckedSubOverflow(M, global_dppm_shares_outcome))?;
        let dppm_fusdc = maths::dppm_payoff(share_bal)?;
        let (ninetails_winner_fusdc, ninetails_loser_fusdc) = maths::ninetails_payoff_winners(
            leftovers,
            user_boosted_shares,
            outcome_boosted_shares,
            all_boosted_shares,
        )?;
        Ok((dppm_fusdc, ninetails_winner_fusdc, ninetails_loser_fusdc))
    }

    #[allow(non_snake_case)]
    pub fn internal_dppm_simulate_payoff_state(
        &self,
        _shares: U256,
        _boosted_shares: U256,
        _outcome_id: FixedBytes<8>,
        _extra_fusdc: U256,
    ) -> R<(U256, U256, U256)> {
        let outcome_1 = self.outcome_list.get(0).unwrap();
        let outcome_2 = self.outcome_list.get(1).unwrap();
        let outcome_boosted_shares = self
            .ninetails_outcome_boosted_shares
            .get(_outcome_id)
            .checked_add(_boosted_shares)
            .ok_or(Error::CheckedAddOverflow)?;
        let all_boosted_shares = self
            .ninetails_global_boosted_shares
            .get()
            .checked_add(_boosted_shares)
            .ok_or(Error::CheckedAddOverflow)?;
        let M1 = {
            let x = self.dppm_outcome_invested.get(outcome_1);
            if _outcome_id == outcome_1 {
                x.checked_add(_extra_fusdc)
                    .ok_or(Error::CheckedAddOverflow)?
            } else {
                x
            }
        };
        let M2 = {
            let x = self.dppm_outcome_invested.get(outcome_2);
            if _outcome_id == outcome_2 {
                x.checked_add(_extra_fusdc)
                    .ok_or(Error::CheckedAddOverflow)?
            } else {
                x
            }
        };
        let winning_dppm_shares = self
            .dppm_shares_outcome
            .get(_outcome_id)
            .checked_add(_shares)
            .ok_or(Error::CheckedAddOverflow)?;
        self.internal_dppm_simulate_payoff(
            _shares,
            _boosted_shares,
            outcome_boosted_shares,
            all_boosted_shares,
            M1,
            M2,
            winning_dppm_shares,
        )
    }

    #[allow(non_snake_case)]
    pub fn internal_dppm_simulate_loser_payoff(
        &self,
        user_boosted_shares: U256,
        winning_outcome_dppm_shares: U256,
    ) -> R<U256> {
        let all_boosted_shares = self.ninetails_global_boosted_shares.get();
        let outcome_1 = self.outcome_list.get(0).unwrap();
        let outcome_2 = self.outcome_list.get(1).unwrap();
        let M1 = self.dppm_outcome_invested.get(outcome_1);
        let M2 = self.dppm_outcome_invested.get(outcome_2);
        let M = M1.checked_add(M2).ok_or(Error::CheckedAddOverflow)?;
        let leftovers = M
            .checked_sub(winning_outcome_dppm_shares)
            .ok_or(Error::CheckedSubOverflow(M, winning_outcome_dppm_shares))?;
        maths::ninetails_payoff_losers(leftovers, user_boosted_shares, all_boosted_shares)
    }

    pub fn internal_dppm_price(&self, id: FixedBytes<8>) -> R<U256> {
        maths::dppm_price(
            self.dppm_outcome_invested.get(id),
            self.dppm_outcome_invested
                .get(self.outcome_list.get(0).unwrap()),
            self.dppm_outcome_invested
                .get(self.outcome_list.get(1).unwrap()),
        )
    }
}
