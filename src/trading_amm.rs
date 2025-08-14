use crate::{
    error::*, events, fusdc_call, immutables::*, maths, proxy, share_call, storage_trading::*,
    utils::*,
};

use stylus_sdk::{alloy_primitives::*, evm};

use alloc::vec::Vec;

impl StorageTrading {
    pub fn internal_amm_ctor(&mut self, outcomes: Vec<FixedBytes<8>>) -> R<()> {
        for outcome_id in outcomes {
            // This isn't a precaution that we actually need, but there may be weird
            // behaviour with this being possible (ie, payoff before the end date).
            assert_or!(!outcome_id.is_zero(), Error::OutcomeIsZero);
            self.outcome_list.push(outcome_id);
            self.amm_outcome_exists.setter(outcome_id).set(true);
        }
        Ok(())
    }

    // Internal rebalancing function to get and set the prices of each
    // amount.
    pub fn internal_amm_get_prices(&mut self) -> R<()> {
        let weights = self
            .outcome_ids_iter()
            .map(|id| {
                self.outcome_ids_iter().fold(U256::from(1), |p, other| {
                    if id == other {
                        p
                    } else {
                        p * self.amm_shares.get(other)
                    }
                })
            })
            .collect::<Vec<_>>();
        let total = weights.iter().copied().sum::<U256>();
        if !total.is_zero() {
            for (i, id) in self.outcome_ids_iter().enumerate().collect::<Vec<_>>() {
                self.amm_outcome_prices
                    .setter(id)
                    .set(maths::mul_div(weights[i], SHARE_DECIMALS_EXP, total)?.0);
            }
        }
        Ok(())
    }

    pub fn internal_amm_add_liquidity(
        &mut self,
        amount: U256,
        recipient: Address,
        min_liquidity: U256,
    ) -> R<(U256, Vec<(FixedBytes<8>, U256)>)> {
        self.require_not_done_predicting()?;
        self.internal_amm_get_prices()?;
        let prev_liquidity = self.amm_liquidity.get();
        for id in self.outcome_ids_iter().collect::<Vec<_>>() {
            let x = self.amm_shares.get(id);
            // Add the unscaled amount to both of these storage values.
            self.amm_shares
                .setter(id)
                .set(x.checked_add(amount).ok_or(Error::CheckedAddOverflow)?);
            let x = self.amm_total_shares.get(id);
            self.amm_total_shares
                .setter(id)
                .set(x.checked_add(amount).ok_or(Error::CheckedAddOverflow)?);
        }
        let prev_shares = self
            .outcome_ids_iter()
            .map(|x| self.amm_shares.get(x))
            .collect::<Vec<_>>();
        let (max_amt, least_likely_outcome_id) = self
            .outcome_ids_iter()
            .fold(None, |acc, id| {
                let shares = self.amm_shares.get(id);
                if let Some((max_shares, _)) = acc {
                    if shares <= max_shares {
                        return acc;
                    }
                }
                Some((shares, id))
            })
            .unwrap();
        let least_likely_ids: Vec<_> = self
            .outcome_ids_iter()
            .filter(|&id| self.amm_shares.get(id) == max_amt)
            .collect();
        for outcome_id in self.outcome_ids_iter().collect::<Vec<_>>() {
            if least_likely_ids.contains(&outcome_id) {
                continue;
            }
            //(amm_shares[least_likely_outcome_id] * amm_outcome_prices[least_likely_outcome_id]) / amm_outcome_prices[outcome_id]
            let new_shares = c!(maths::mul_div(
                self.amm_shares.get(least_likely_outcome_id),
                self.amm_outcome_prices.get(least_likely_outcome_id),
                self.amm_outcome_prices.get(outcome_id)
            ))
            .0;
            self.amm_shares.setter(outcome_id).set(new_shares);
        }
        let product = self
            .outcome_ids_iter()
            .map(|x| self.amm_shares.get(x))
            .product();
        let new_liq = c!(maths::rooti(product, self.outcome_list.len() as u32));
        let liq_shares_minted = c!(new_liq
            .checked_sub(prev_liquidity)
            .ok_or(Error::CheckedSubOverflow(new_liq, prev_liquidity)));
        if !self.amm_liquidity.get().is_zero() {
            self.rebalance_fees(recipient, liq_shares_minted, true)?;
        }
        self.amm_liquidity.set(new_liq);
        // Time to mint the user some shares. For now, we're going to simply bump
        // their balance.
        let add_user_liq = c!(self.amm_liquidity.get().checked_sub(prev_liquidity).ok_or(
            Error::CheckedSubOverflow(self.amm_liquidity.get(), prev_liquidity)
        ));
        let user_liq_shares = self.amm_user_liquidity_shares.get(recipient);
        self.amm_user_liquidity_shares.setter(recipient).set(
            user_liq_shares
                .checked_add(add_user_liq)
                .ok_or(Error::CheckedAddOverflow)?,
        );
        let shares_received = self
            .outcome_ids_iter()
            .enumerate()
            .map(|(i, outcome_id)| {
                let outcome_shares_received = c!(prev_shares[i]
                    .checked_sub(self.amm_shares.get(outcome_id))
                    .ok_or(Error::CheckedSubOverflow(
                        prev_shares[i],
                        self.amm_shares.get(outcome_id)
                    )));
                if !outcome_shares_received.is_zero() {
                    share_call::mint(
                        proxy::get_share_addr(
                            self.factory_addr.get(),
                            contract_address(),
                            self.share_impl.get(),
                            outcome_id,
                        ),
                        recipient,
                        outcome_shares_received,
                    )?;
                    evm::log(events::SharesMinted {
                        identifier: outcome_id,
                        shareAmount: outcome_shares_received,
                        spender: msg_sender(),
                        recipient,
                        fusdcSpent: U256::ZERO,
                    });
                }
                Ok((outcome_id, outcome_shares_received))
            })
            .collect::<R<Vec<_>>>()?;
        assert_or!(
            add_user_liq >= min_liquidity,
            Error::NotEnoughLiquidityReturned
        );
        evm::log(events::LiquidityAdded {
            sender: msg_sender(),
            fusdcAmt: amount,
            liquidityShares: add_user_liq,
            recipient,
        });
        Ok((add_user_liq, shares_received))
    }

    pub fn internal_amm_remove_liquidity(
        &mut self,
        amount: U256,
        recipient: Address,
    ) -> R<(U256, U256, Vec<(FixedBytes<8>, U256)>)> {
        self.internal_amm_get_prices()?;
        assert_or!(
            self.amm_liquidity.get() > U256::ZERO,
            Error::NotEnoughLiquidity
        );
        let (most_likely_amt, most_likely_outcome_id) = self
            .outcome_ids_iter()
            .fold(None, |acc, id| {
                let shares = self.amm_shares.get(id);
                if let Some((max_shares, _)) = acc {
                    if shares > max_shares {
                        return acc;
                    }
                }
                Some((shares, id))
            })
            .unwrap();
        let most_likely_ids: Vec<_> = self
            .outcome_ids_iter()
            .filter(|&id| self.amm_shares.get(id) == most_likely_amt)
            .collect();
        // This is the amount of fUSDC to return to the end user.
        let liquidity_shares_val = c!(maths::mul_div(
            self.amm_shares.get(most_likely_outcome_id),
            amount,
            self.amm_liquidity.get()
        ))
        .0;
        for outcome_id in self.outcome_ids_iter().collect::<Vec<_>>() {
            {
                let shares = c!(self
                    .amm_shares
                    .get(outcome_id)
                    .checked_sub(liquidity_shares_val)
                    .ok_or(Error::CheckedSubOverflow(
                        self.amm_shares.get(outcome_id),
                        liquidity_shares_val
                    )));
                self.amm_shares.setter(outcome_id).set(shares);
            }
            {
                let total_shares = c!(self
                    .amm_total_shares
                    .get(outcome_id)
                    .checked_sub(liquidity_shares_val)
                    .ok_or(Error::CheckedSubOverflow(
                        self.amm_total_shares.get(outcome_id),
                        liquidity_shares_val,
                    )));
                self.amm_total_shares.setter(outcome_id).set(total_shares);
            }
        }
        let prev_shares = self
            .outcome_ids_iter()
            .map(|x| self.amm_shares.get(x))
            .collect::<Vec<_>>();
        for outcome_id in self.outcome_ids_iter().collect::<Vec<_>>() {
            if most_likely_ids.contains(&outcome_id) {
                continue;
            }
            let s = c!(maths::mul_div(
                self.amm_shares.get(most_likely_outcome_id),
                self.amm_outcome_prices.get(most_likely_outcome_id),
                self.amm_outcome_prices.get(outcome_id)
            ))
            .0;
            self.amm_shares.setter(outcome_id).set(s);
        }
        let product = self
            .outcome_ids_iter()
            .map(|x| self.amm_shares.get(x))
            .product();
        let new_liq = c!(maths::rooti(product, self.outcome_list.len() as u32));
        if FUSDC_DECIMALS_EXP > new_liq {
            return Err(Error::CannotRemoveAllLiquidity);
        }
        let fees_earned = self.internal_amm_claim_all_fees(msg_sender(), recipient)?;
        self.rebalance_fees(msg_sender(), amount, false)?;
        self.amm_liquidity.set(new_liq);
        {
            let user_liq_shares = self.amm_user_liquidity_shares.get(msg_sender());
            self.amm_user_liquidity_shares
                .setter(msg_sender())
                .set(c!(user_liq_shares
                    .checked_sub(amount)
                    .ok_or(Error::CheckedSubOverflow(user_liq_shares, amount))));
        }
        let shares_received = self
            .outcome_ids_iter()
            .enumerate()
            .map(|(i, outcome_id)| {
                let outcome_shares_received = c!(prev_shares[i]
                    .checked_sub(self.amm_shares.get(outcome_id))
                    .ok_or(Error::CheckedSubOverflow(
                        prev_shares[i],
                        self.amm_shares.get(outcome_id),
                    )));
                if !outcome_shares_received.is_zero() {
                    share_call::mint(
                        proxy::get_share_addr(
                            self.factory_addr.get(),
                            contract_address(),
                            self.share_impl.get(),
                            outcome_id,
                        ),
                        recipient,
                        outcome_shares_received,
                    )?;
                    evm::log(events::SharesMinted {
                        identifier: outcome_id,
                        shareAmount: outcome_shares_received,
                        spender: msg_sender(),
                        recipient,
                        fusdcSpent: U256::ZERO,
                    });
                }
                Ok((outcome_id, outcome_shares_received))
            })
            .collect::<R<Vec<_>>>()?;
        evm::log(events::LiquidityRemoved {
            fusdcAmt: amount,
            recipient,
            liquidityAmt: liquidity_shares_val,
        });
        Ok((liquidity_shares_val, fees_earned, shares_received))
    }

    /// Sell the amount of shares, using the USD amount, returning the shares
    /// sold, and the amount of fUSDC to return to the user. Expects the caller
    /// to do the selling.
    pub fn internal_amm_burn(
        &mut self,
        sender: Address,
        outcome_id: FixedBytes<8>,
        usd_amt: U256,
        min_shares: U256,
    ) -> R<(U256, U256)> {
        assert_or!(
            !self.amm_liquidity.get().is_zero(),
            Error::NotEnoughLiquidity
        );
        assert_or!(!usd_amt.is_zero(), Error::ZeroAmount);
        // Check if the outcome exists first! Nice safety precaution.
        assert_or!(
            self.amm_outcome_exists.get(outcome_id),
            Error::NonexistentOutcome
        );
        let outcome_previous_shares = self.amm_shares.get(outcome_id);
        for o in self.outcome_ids_iter().collect::<Vec<_>>() {
            if outcome_id == o {
                continue;
            }
            {
                let shares = c!(self
                    .amm_shares
                    .get(o)
                    .checked_sub(usd_amt)
                    .ok_or(Error::CheckedSubOverflow(self.amm_shares.get(o), usd_amt)));
                self.amm_shares.setter(o).set(shares);
            }
            {
                let total_shares = c!(self.amm_total_shares.get(o).checked_sub(usd_amt).ok_or(
                    Error::CheckedSubOverflow(self.amm_total_shares.get(o), usd_amt)
                ));
                self.amm_total_shares.setter(o).set(total_shares);
            }
        }
        let product = self
            .outcome_ids_iter()
            .filter(|x| *x != outcome_id)
            .map(|x| self.amm_shares.get(x))
            .product::<U256>();
        self.amm_shares.setter(outcome_id).set(
            self.amm_liquidity
                .get()
                .pow(U256::from(self.outcome_list.len()))
                .div_ceil(product),
        );
        let burned_shares = c!(self
            .amm_shares
            .get(outcome_id)
            .checked_add(usd_amt)
            .ok_or(Error::CheckedAddOverflow)?
            .checked_sub(outcome_previous_shares)
            .ok_or(Error::CheckedSubOverflow(
                self.amm_shares.get(outcome_id),
                outcome_previous_shares,
            )));
        assert_or!(
            burned_shares >= min_shares,
            Error::NotEnoughSharesBurned(min_shares, burned_shares)
        );
        evm::log(events::AmmDetails {
            product,
            shares: self
                .outcome_ids_iter()
                .map(|id| events::ShareDetail {
                    shares: self.amm_shares.get(id),
                    identifier: id,
                })
                .collect::<Vec<_>>(),
        });
        c!(share_call::burn(
            proxy::get_share_addr(
                self.factory_addr.get(),
                contract_address(),
                self.share_impl.get(),
                outcome_id,
            ),
            sender,
            burned_shares
        ));
        Ok((burned_shares, usd_amt))
    }

    pub fn internal_amm_claim_liquidity(
        &mut self,
        sender: Address,
        sender_liq_shares: U256,
        recipient: Address,
    ) -> R<U256> {
        assert_or!(!self.when_decided.get().is_zero(), Error::NotDecided);
        let sender_max_shares = self.amm_user_liquidity_shares.get(sender);
        let sender_liq_shares = if sender_liq_shares.is_zero() {
            sender_max_shares
        } else {
            sender_liq_shares
        };
        // Make sure the user can't drain more than they own.
        assert_or!(
            sender_max_shares >= sender_liq_shares,
            Error::NotEnoughLiquidity
        );
        let liq_price = maths::mul_div(
            self.amm_shares.get(self.winner.get()),
            SHARE_DECIMALS_EXP,
            self.amm_liquidity.get(),
        )?
        .0;
        let fusdc_amt = maths::mul_div(sender_liq_shares, liq_price, SHARE_DECIMALS_EXP)?.0;
        evm::log(events::LiquidityClaimed {
            sender,
            recipient,
            fusdcAmt: fusdc_amt,
            sharesAmount: sender_liq_shares,
        });
        fusdc_call::transfer(recipient, fusdc_amt)?;
        self.amm_user_liquidity_shares.setter(sender).set(
            sender_max_shares
                .checked_sub(sender_liq_shares)
                .ok_or(Error::CheckedSubOverflow(
                    sender_max_shares,
                    sender_liq_shares,
                ))?,
        );
        Ok(fusdc_amt)
    }

    /// Rebalance the calculated user fee weight.
    pub fn rebalance_fees(&mut self, sender: Address, delta_liq: U256, is_add: bool) -> R<()> {
        let fee_weight = maths::mul_div_round_up(
            delta_liq,
            self.amm_fees_collected_weighted.get(),
            self.amm_liquidity.get(),
        )?;
        if is_add {
            {
                let x = self
                    .amm_fees_collected_weighted
                    .get()
                    .checked_add(fee_weight)
                    .ok_or(Error::CheckedAddOverflow)?;
                self.amm_fees_collected_weighted.set(x);
            }
            {
                let x = self.amm_lp_user_fees_claimed.get(sender);
                self.amm_lp_user_fees_claimed
                    .setter(sender)
                    .set(x.checked_add(fee_weight).ok_or(Error::CheckedAddOverflow)?);
            }
        } else {
            {
                let x = self
                    .amm_fees_collected_weighted
                    .get()
                    .checked_sub(fee_weight)
                    .ok_or(Error::CheckedAddOverflow)?;
                self.amm_fees_collected_weighted.set(x);
            }
            {
                let x = self.amm_lp_user_fees_claimed.get(sender);
                self.amm_lp_user_fees_claimed
                    .setter(sender)
                    .set(x.checked_sub(fee_weight).ok_or(Error::CheckedAddOverflow)?);
            }
        }
        Ok(())
    }

    pub fn internal_amm_claim_lp_fees(&mut self, spender: Address, recipient: Address) -> R<U256> {
        let sender_liq_shares = self.amm_user_liquidity_shares.get(msg_sender());
        if sender_liq_shares.is_zero() {
            return Ok(U256::ZERO);
        }
        let entitled = maths::mul_div(
            sender_liq_shares,
            self.amm_fees_collected_weighted.get(),
            self.amm_liquidity.get(),
        )?
        .0;
        let claimed = self.amm_lp_user_fees_claimed.get(spender);
        // Avoid a rounding error by clamping to 0 if we're off by 1.
        let fees = entitled.saturating_sub(claimed);
        if fees.is_zero() {
            return Ok(U256::ZERO);
        }
        // Prevent people from double claiming.
        self.amm_lp_user_fees_claimed
            .setter(spender)
            .set(claimed.checked_add(fees).ok_or(Error::CheckedAddOverflow)?);
        fusdc_call::transfer(recipient, fees)?;
        evm::log(events::LPFeesClaimed {
            sender: spender,
            recipient,
            feesEarned: fees,
            senderLiquidityShares: sender_liq_shares,
        });
        Ok(fees)
    }

    // Activate the resolution function to trigger a AMM payoff if the market is concluded.
    pub fn internal_amm_payoff(
        &mut self,
        outcome_id: FixedBytes<8>,
        share_amt: U256,
        recipient: Address,
    ) -> R<U256> {
        assert_or!(self.winner.get() == outcome_id, Error::NotWinner);
        let share_addr = proxy::get_share_addr(
            self.factory_addr.get(),
            contract_address(), // Address of this contract, the Trading contract.
            self.share_impl.get(),
            outcome_id,
        );
        let share_bal = U256::min(share_call::balance_of(share_addr, msg_sender())?, share_amt);
        assert_or!(share_bal > U256::ZERO, Error::ZeroShares);
        share_call::burn(share_addr, msg_sender(), share_bal)?;
        fusdc_call::transfer(recipient, share_bal)?;
        evm::log(events::PayoffActivated {
            identifier: outcome_id,
            sharesSpent: share_bal,
            spender: msg_sender(),
            recipient,
            fusdcReceived: share_bal,
        });
        Ok(share_bal)
    }

    pub fn internal_amm_mint(
        &mut self,
        outcome_id: FixedBytes<8>,
        usd_amt: U256,
        recipient: Address,
    ) -> R<U256> {
        // Check if the outcome exists first!
        assert_or!(
            self.amm_outcome_exists.get(outcome_id),
            Error::NonexistentOutcome
        );
        assert_or!(
            !self.amm_liquidity.get().is_zero(),
            Error::NotEnoughLiquidity
        );
        for outcome_id in self.outcome_ids_iter().collect::<Vec<_>>() {
            {
                let shares = self.amm_shares.get(outcome_id);
                self.amm_shares.setter(outcome_id).set(
                    shares
                        .checked_add(usd_amt)
                        .ok_or(Error::CheckedAddOverflow)?,
                );
            }
            {
                let total_shares = self.amm_total_shares.get(outcome_id);
                self.amm_total_shares.setter(outcome_id).set(
                    total_shares
                        .checked_add(usd_amt)
                        .ok_or(Error::CheckedAddOverflow)?,
                );
            }
        }
        let outcome_previous_shares = self.amm_shares.get(outcome_id);
        let product = self
            .outcome_ids_iter()
            .filter(|id| *id != outcome_id)
            .map(|x| self.amm_shares.get(x))
            .product::<U256>();
        // We don't think that pow_ceil will be an issue with overflowing due to
        // the characteristics of the model.
        self.amm_shares.setter(outcome_id).set(
            self.amm_liquidity
                .get()
                .pow(U256::from(self.outcome_list.len()))
                .div_ceil(product),
        );
        let shares = c!(outcome_previous_shares
            .checked_sub(self.amm_shares.get(outcome_id))
            .ok_or(Error::CheckedSubOverflow(
                outcome_previous_shares,
                self.amm_shares.get(outcome_id),
            )));
        evm::log(events::AmmDetails {
            product,
            shares: self
                .outcome_ids_iter()
                .map(|id| events::ShareDetail {
                    shares: self.amm_shares.get(id),
                    identifier: id,
                })
                .collect::<Vec<_>>(),
        });
        share_call::mint(
            proxy::get_share_addr(
                self.factory_addr.get(),
                contract_address(),
                self.share_impl.get(),
                outcome_id,
            ),
            recipient,
            shares,
        )?;
        evm::log(events::SharesMinted {
            identifier: outcome_id,
            shareAmount: shares,
            spender: msg_sender(),
            recipient,
            fusdcSpent: usd_amt,
        });
        Ok(shares)
    }

    // The same as the mint function, but shadows the tokens instead, and
    // doesn't update anything.
    pub fn internal_amm_quote_mint(&self, outcome_id: FixedBytes<8>, usd_amt: U256) -> R<U256> {
        assert_or!(
            self.amm_outcome_exists.get(outcome_id),
            Error::NonexistentOutcome
        );
        if self.amm_liquidity.get().is_zero() {
            return Ok(U256::ZERO);
        }
        let shares_tmp = self
            .outcome_ids_iter()
            .map(|id| {
                let added = self
                    .amm_shares
                    .get(id)
                    .checked_add(usd_amt)
                    .ok_or(Error::CheckedAddOverflow)?;
                Ok((id, added))
            })
            .collect::<R<Vec<_>>>()?;
        let product = shares_tmp
            .iter()
            .filter(|(id, _)| *id != outcome_id)
            .map(|(_, s)| *s)
            .product::<U256>();
        let n = U256::from(self.outcome_list.len());
        let target = self.amm_liquidity.get().pow(n).div_ceil(product);
        let current = shares_tmp
            .iter()
            .find(|(id, _)| *id == outcome_id)
            .unwrap()
            .1;
        let minted = c!(current
            .checked_sub(target)
            .ok_or(Error::CheckedSubOverflow(current, target)));
        Ok(minted)
    }

    // Quote the burning, returning the fee that we added to the estimated amount for subtraction later if needed.
    pub fn internal_amm_quote_burn(&self, outcome_id: FixedBytes<8>, usd_amt: U256) -> R<U256> {
        assert_or!(
            self.amm_outcome_exists.get(outcome_id),
            Error::NonexistentOutcome
        );
        if self.amm_liquidity.get().is_zero() {
            return Ok(U256::ZERO);
        }
        let prev_after = self.amm_shares.get(outcome_id);
        let product = self
            .outcome_ids_iter()
            .filter(|id| *id != outcome_id)
            .map(|id| {
                self.amm_shares
                    .get(id)
                    .checked_sub(usd_amt)
                    .ok_or(Error::CheckedSubOverflow(self.amm_shares.get(id), usd_amt))
            })
            .collect::<R<Vec<_>>>()?
            .iter()
            .product();
        let new_shares = self
            .amm_liquidity
            .get()
            .pow(U256::from(self.outcome_list.len()))
            .div_ceil(product);
        new_shares
            .checked_add(usd_amt)
            .ok_or(Error::CheckedAddOverflow)?
            .checked_sub(prev_after)
            .ok_or(Error::CheckedSubOverflow(new_shares, prev_after))
    }

    pub fn internal_amm_estimate_burn(
        &self,
        outcome_id: FixedBytes<8>,
        shares_target: U256,
    ) -> R<U256> {
        let mut lower_bound = U256::ZERO;
        let mut upper_bound = shares_target * U256::from(2);
        let mut current_usd = (lower_bound + upper_bound) / U256::from(2);
        let tolerance = U256::from(1000);
        for _ in 0..1000 {
            match self.internal_amm_quote_burn(outcome_id, current_usd) {
                Ok(shares_sold) if shares_sold > shares_target => {
                    if upper_bound == current_usd {
                        current_usd = current_usd.saturating_sub(U256::from(1));
                    }
                    upper_bound = current_usd
                }
                Ok(shares_sold) if shares_target - shares_sold < tolerance => {
                    return Ok(current_usd)
                }
                Err(Error::CheckedSubOverflow(_, _)) => {
                    upper_bound = current_usd;
                }
                Ok(_) => {
                    lower_bound = current_usd;
                    if lower_bound == upper_bound {
                        upper_bound = upper_bound.saturating_add(U256::from(1));
                    }
                }
                Err(err) => return Err(err),
            }
            current_usd = (lower_bound + upper_bound) / U256::from(2);
        }
        Ok(current_usd)
    }

    pub fn internal_amm_claim_addr_fees(&mut self, sender: Address, recipient: Address) -> R<U256> {
        let owed = self.fees_owed_addresses.get(sender);
        fusdc_call::transfer(recipient, owed)?;
        self.fees_owed_addresses.setter(sender).set(U256::ZERO);
        evm::log(events::AddressFeesClaimed {
            recipient,
            amount: owed,
        });
        Ok(owed)
    }

    pub fn internal_amm_price(&mut self, outcome: FixedBytes<8>) -> R<U256> {
        self.internal_amm_get_prices()?;
        Ok(self.amm_outcome_prices.get(outcome))
    }

    pub fn internal_amm_claim_all_fees(&mut self, sender: Address, recipient: Address) -> R<U256> {
        let lp_fees = self.internal_amm_claim_lp_fees(sender, recipient)?;
        let addr_fees = self.internal_amm_claim_addr_fees(sender, recipient)?;
        Ok(lp_fees + addr_fees)
    }
}

#[cfg(not(target_arch = "wasm32"))]
impl StorageTrading {
    pub fn test_set_outcome_shares(&mut self, liquidity: u64, new_shares: &[(FixedBytes<8>, u64)]) {
        self.amm_liquidity.set(U256::from(liquidity));
        for (id, x) in new_shares {
            self.amm_shares.setter(*id).set(U256::from(*x));
        }
        self.internal_amm_get_prices().unwrap();
    }
}
