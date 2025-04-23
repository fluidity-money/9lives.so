use crate::{
    error::*, events, fees::*, fusdc_call, immutables::*, maths, proxy, share_call,
    storage_trading::*, utils::*,
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
        let weights: Vec<U256> = self
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
            .collect();
        let total: U256 = weights.iter().copied().sum();
        if total > U256::ZERO {
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
    ) -> R<(U256, Vec<(FixedBytes<8>, U256)>)> {
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
        let (least_likely_amt, least_likely_outcome_id) = self
            .outcome_ids_iter()
            .fold(None, |acc, id| {
                let shares = self.amm_shares.get(id);
                if let Some((max_shares, _)) = acc {
                    if shares < max_shares {
                        return acc;
                    }
                }
                Some((shares, id))
            })
            .unwrap();
        let least_likely_ids: Vec<_> = self
            .outcome_ids_iter()
            .filter(|&id| self.amm_shares.get(id) == least_likely_amt)
            .collect();
        for outcome_id in self.outcome_ids_iter().collect::<Vec<_>>() {
            if least_likely_ids.contains(&outcome_id) {
                continue;
            }
            //(amm_shares[least_likely_outcome_id] * amm_outcome_prices[least_likely_outcome_id]) / amm_outcome_prices[outcome_id]
            let new_shares = c!(maths::mul_div_round_up(
                self.amm_shares.get(least_likely_outcome_id),
                self.amm_outcome_prices.get(least_likely_outcome_id),
                self.amm_outcome_prices.get(outcome_id)
            ));
            self.amm_shares.setter(outcome_id).set(new_shares);
        }
        let product = self
            .outcome_ids_iter()
            .map(|x| self.amm_shares.get(x))
            .product();
        self.amm_liquidity
            .set(maths::rooti(product, self.outcome_list.len() as u32));
        // Time to mint the user some shares. For now, we're going to simply bump
        // their balance.
        {
            let add_user_liq = c!(self
                .amm_liquidity
                .get()
                .checked_sub(prev_liquidity)
                .ok_or(Error::CheckedSubOverflow));
            let user_liq_shares = self.amm_user_liquidity_shares.get(recipient);
            self.amm_user_liquidity_shares.setter(recipient).set(
                user_liq_shares
                    .checked_add(add_user_liq)
                    .ok_or(Error::CheckedAddOverflow)?,
            );
        }
        let shares_received = self
            .outcome_ids_iter()
            .enumerate()
            .map(|(i, outcome_id)| {
                let outcome_shares_received = c!(prev_shares[i]
                    .checked_sub(self.amm_shares.get(outcome_id))
                    .ok_or(Error::CheckedSubOverflow));
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
                    evm::log(events::LiquidityAddedSharesSent {
                        share: outcome_id,
                        recipient,
                        amount: outcome_shares_received,
                    });
                }
                Ok((outcome_id, outcome_shares_received))
            })
            .collect::<Result<Vec<_>, _>>()?;
        evm::log(events::LiquidityAdded {
            fusdcAmt: amount,
            recipient,
        });
        Ok((amount, shares_received))
    }

    pub fn internal_amm_remove_liquidity(
        &mut self,
        amount: U256,
        recipient: Address,
    ) -> R<(U256, Vec<(FixedBytes<8>, U256)>)> {
        self.internal_amm_get_prices()?;
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
        let liquidity_shares_val = c!(maths::mul_div_round_up(
            self.amm_shares.get(most_likely_outcome_id),
            amount,
            self.amm_liquidity.get()
        ));
        for outcome_id in self.outcome_ids_iter().collect::<Vec<_>>() {
            {
                let shares = c!(self
                    .amm_shares
                    .get(outcome_id)
                    .checked_sub(liquidity_shares_val)
                    .ok_or(Error::CheckedSubOverflow));
                self.amm_shares.setter(outcome_id).set(shares);
            }
            {
                let total_shares = self
                    .amm_total_shares
                    .get(outcome_id)
                    .wrapping_sub(liquidity_shares_val);
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
            let s = c!(maths::mul_div_round_up(
                self.amm_shares.get(most_likely_outcome_id),
                self.amm_outcome_prices.get(most_likely_outcome_id),
                self.amm_outcome_prices.get(outcome_id)
            ));
            self.amm_shares.setter(outcome_id).set(s);
        }
        let product = self
            .outcome_ids_iter()
            .map(|x| self.amm_shares.get(x))
            .product();
        self.amm_liquidity
            .set(maths::rooti(product, self.outcome_list.len() as u32));
        {
            let user_liq_shares = self.amm_user_liquidity_shares.get(msg_sender());
            self.amm_user_liquidity_shares
                .setter(msg_sender())
                .set(user_liq_shares - amount);
        }
        let shares_received = self
            .outcome_ids_iter()
            .enumerate()
            .map(|(i, outcome_id)| {
                let outcome_shares_received = prev_shares[i]
                    .checked_sub(self.amm_shares.get(outcome_id))
                    .ok_or(Error::CheckedSubOverflow)?;
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
                    evm::log(events::LiquidityRemovedSharesSent {
                        share: outcome_id,
                        recipient,
                        amount: outcome_shares_received,
                    });
                }
                Ok((outcome_id, outcome_shares_received))
            })
            .collect::<Result<Vec<_>, _>>()?;
        evm::log(events::LiquidityRemoved {
            fusdcAmt: amount,
            recipient,
            liquidityAmt: liquidity_shares_val,
        });
        Ok((liquidity_shares_val, shares_received))
    }

    // Sell the amount of shares, using the USD amount, returning the shares
    // sold. Does the transferring.
    pub fn internal_amm_burn(
        &mut self,
        outcome_id: FixedBytes<8>,
        usd_amt: U256,
        recipient: Address,
    ) -> R<U256> {
        // Check if the outcome exists first! Nice safety precaution.
        assert_or!(
            self.amm_outcome_exists.get(outcome_id),
            Error::NonexistentOutcome
        );
        let fee_for_creator = maths::mul_div(usd_amt, self.fee_creator.get(), FEE_SCALING)?.0;
        c!(fusdc_call::transfer(
            self.fee_recipient.get(),
            fee_for_creator
        ));
        let fee_for_lp = maths::mul_div(usd_amt, self.fee_lp.get(), FEE_SCALING)?.0;
        let usd_amt = usd_amt
            .checked_sub(fee_for_creator)
            .ok_or(Error::CheckedSubOverflow)?
            .checked_sub(fee_for_lp)
            .ok_or(Error::CheckedSubOverflow)?;
        for outcome_id in self.outcome_ids_iter().collect::<Vec<_>>() {
            {
                let shares = c!(self
                    .amm_shares
                    .get(outcome_id)
                    .checked_sub(usd_amt)
                    .ok_or(Error::CheckedSubOverflow));
                self.amm_shares.setter(outcome_id).set(shares);
            }
            {
                let total_shares = c!(self
                    .amm_total_shares
                    .get(outcome_id)
                    .checked_sub(usd_amt)
                    .ok_or(Error::CheckedSubOverflow));
                self.amm_total_shares.setter(outcome_id).set(total_shares);
            }
        }
        let outcome_previous_shares = self.amm_shares.get(outcome_id);
        let product = self
            .outcome_ids_iter()
            .filter(|x| *x != outcome_id)
            .map(|x| self.amm_shares.get(x))
            .product::<U256>();
        self.amm_shares.setter(outcome_id).set(
            self.amm_liquidity
                .get()
                .pow(U256::from(self.outcome_list.len()))
                .checked_div(product)
                .ok_or(Error::CheckedDivOverflow)?,
        );
        let shares = c!(self
            .amm_shares
            .get(outcome_id)
            .checked_sub(outcome_previous_shares)
            .ok_or(Error::CheckedSubOverflow));
        c!(share_call::burn(
            proxy::get_share_addr(
                self.factory_addr.get(),
                contract_address(),
                self.share_impl.get(),
                outcome_id,
            ),
            msg_sender(),
            shares
        ));
        evm::log(events::SharesBurned {
            identifier: outcome_id,
            shareAmount: shares,
            spender: msg_sender(),
            recipient,
            fusdcReturned: shares,
        });
        Ok(shares)
    }

    pub fn internal_amm_claim_liquidity(&mut self, recipient: Address) -> R<U256> {
        assert_or!(!self.when_decided.get().is_zero(), Error::NotDecided);
        let sender_liq_shares = self.amm_user_liquidity_shares.get(msg_sender());
        assert_or!(!sender_liq_shares.is_zero(), Error::NotEnoughLiquidity);
        let liq_price = maths::mul_div(
            self.amm_shares.get(self.winner.get()),
            SHARE_DECIMALS_EXP,
            self.amm_liquidity.get(),
        )?
        .0;
        let claimed_amt = maths::mul_div(sender_liq_shares, liq_price, SHARE_DECIMALS_EXP)?.0;
        fusdc_call::transfer(recipient, claimed_amt)?;
        self.amm_user_liquidity_shares
            .setter(msg_sender())
            .set(U256::ZERO);
        evm::log(events::LiquidityClaimed {
            recipient,
            fusdcAmt: claimed_amt,
        });
        Ok(claimed_amt)
    }

    pub fn internal_amm_claim_lp_fees(&mut self, recipient: Address) -> R<U256> {
        let sender_liq_shares = self.amm_user_liquidity_shares.get(msg_sender());
        assert_or!(!sender_liq_shares.is_zero(), Error::NotEnoughLiquidity);
        let fees = maths::mul_div(
            self.amm_fees_earned_lps.get(),
            SHARE_DECIMALS_EXP,
            self.amm_liquidity.get(),
        )?
        .0
        .checked_mul(sender_liq_shares)
        .ok_or(Error::CheckedMulOverflow)?;
        fusdc_call::transfer(recipient, fees)?;
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
        let fee_for_creator = maths::mul_div(usd_amt, self.fee_creator.get(), FEE_SCALING)?.0;
        let fee_for_lp = maths::mul_div(usd_amt, self.fee_lp.get(), FEE_SCALING)?.0;
        c!(fusdc_call::transfer(
            self.fee_recipient.get(),
            fee_for_creator
        ));
        // It will never be the case that the fee exceeds the amount here, but
        // this good programming regardless to check.
        let usd_amt = usd_amt
            .checked_sub(fee_for_creator)
            .ok_or(Error::CheckedSubOverflow)?
            .checked_sub(fee_for_lp)
            .ok_or(Error::CheckedSubOverflow)?;
        {
            let fees = self.amm_fees_earned_lps.get();
            self.amm_fees_earned_lps.set(
                fees.checked_add(fee_for_lp)
                    .ok_or(Error::CheckedAddOverflow)?,
            );
        }
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
        self.amm_shares.setter(outcome_id).set(
            self.amm_liquidity
                .get()
                .pow(U256::from(self.outcome_list.len()))
                .checked_div(product)
                .ok_or(Error::CheckedDivOverflow)?,
        );
        let shares = c!(outcome_previous_shares
            .checked_sub(self.amm_shares.get(outcome_id))
            .ok_or(Error::CheckedSubOverflow));
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
    pub fn internal_amm_quote(&self, outcome_id: FixedBytes<8>, usd_amt: U256) -> R<U256> {
        let outcome_shares = self
            .amm_shares
            .get(outcome_id)
            .checked_add(usd_amt)
            .ok_or(Error::CheckedAddOverflow)?;
        let product = self
            .outcome_ids_iter()
            .filter(|id| *id != outcome_id)
            .map(|x| self.amm_shares.get(x))
            .product::<U256>();
        outcome_shares
            .checked_sub(
                self.amm_liquidity
                    .get()
                    .pow(U256::from(self.outcome_list.len()))
                    .checked_div(product)
                    .ok_or(Error::CheckedDivOverflow)?,
            )
            .ok_or(Error::CheckedSubOverflow)
    }

    pub fn internal_amm_price(&mut self, outcome: FixedBytes<8>) -> R<U256> {
        self.internal_amm_get_prices()?;
        Ok(self.amm_outcome_prices.get(outcome))
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
