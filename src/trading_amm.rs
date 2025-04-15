use crate::{error::*, immutables::*, maths, proxy, share_call, storage_trading::*, utils::*, fusdc_call};

use stylus_sdk::alloy_primitives::*;

use alloc::vec::Vec;

impl StorageTrading {
    pub fn internal_amm_ctor(&mut self, outcomes: Vec<FixedBytes<8>>) -> R<()> {
        for outcome_id in outcomes {
            // This isn't a precaution that we actually need, but there may be weird
            // behaviour with this being possible (ie, payoff before the end date).
            assert_or!(!outcome_id.is_zero(), Error::OutcomeIsZero);
            self.outcome_list.push(outcome_id);
        }
        Ok(())
    }

    // Internal rebalancing function to get and set the prices of each
    // amount.
    fn internal_amm_get_prices(&mut self) {
        let outcome_price_weights = self
            .outcome_ids_iter()
            .map(|id| {
                self.outcome_ids_iter()
                    .fold(SCALING_FACTOR, |product, other_id| {
                        if id == other_id {
                            return product;
                        }
                        product * self.amm_shares.get(other_id)
                    })
            })
            .collect::<Vec<_>>();
        let price_weight_of_all_outcomes = outcome_price_weights.iter().sum::<U256>();
        if price_weight_of_all_outcomes > U256::ZERO {
            for (i, id) in self.outcome_ids_iter().enumerate().collect::<Vec<_>>() {
                // The previously constructed map should be equivalent to this still.
                self.amm_outcome_prices.setter(id).set(
                    (outcome_price_weights[i] * SCALING_FACTOR) / price_weight_of_all_outcomes,
                );
            }
        }
    }

    pub fn internal_amm_add_liquidity(&mut self, amount: U256, recipient: Address) -> R<U256> {
        self.internal_amm_get_prices();
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
        let unscaled_prev_shares = self
            .outcome_ids_iter()
            .map(|x| self.amm_shares.get(x))
            .collect::<Vec<_>>();
        // There should always be an answer here! We don't allow someone to set
        // up with no outcomes.
        let (unscaled_least_likely_amt, least_likely_outcome_id) = self
            .outcome_ids_iter()
            .fold(None, |acc, id| {
                let unscaled_shares = self.amm_shares.get(id);
                if let Some((unscaled_max_shares, _)) = acc {
                    if unscaled_shares < unscaled_max_shares {
                        return acc;
                    }
                }
                Some((unscaled_shares, id))
            })
            .unwrap();
        // Recompute shares to preserve price ratios. This is not inclusive of least indices!
        for outcome_id in self.outcome_ids_iter().collect::<Vec<_>>() {
            if self.amm_shares.get(outcome_id) == unscaled_least_likely_amt {
                continue;
            }
            //(amm_shares[least_likely_outcome_id] * amm_outcome_prices[least_likely_outcome_id]) / amm_outcome_prices[outcome_id]
            //FIXME
            let unscaled_new_shares = self
                .amm_shares
                .get(least_likely_outcome_id)
                .checked_mul(self.amm_outcome_prices.get(least_likely_outcome_id))
                .ok_or(Error::CheckedMulOverflow)?
                .checked_div(self.amm_outcome_prices.get(outcome_id))
                .ok_or(Error::CheckedDivOverflow)?
                .checked_div(SCALING_FACTOR)
                .ok_or(Error::CheckedDivOverflow)?;
            self.amm_shares.setter(outcome_id).set(unscaled_new_shares);
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
            let add_user_liq = self
                .amm_liquidity
                .get()
                .checked_sub(prev_liquidity)
                .ok_or(Error::CheckedSubOverflow)?;
            let user_liq_shares = self.amm_user_liquidity_shares.get(recipient);
            self.amm_user_liquidity_shares.setter(recipient).set(
                user_liq_shares
                    .checked_add(add_user_liq)
                    .ok_or(Error::CheckedAddOverflow)?,
            );
        }
        for (i, outcome_id) in self.outcome_ids_iter().enumerate() {
            let unscaled_outcome_shares_received =
                unscaled_prev_shares[i] - self.amm_shares.get(outcome_id);
            c!(share_call::mint(
                proxy::get_share_addr(
                    self.factory_addr.get(),
                    contract_address(),
                    self.share_impl.get(),
                    outcome_id,
                ),
                recipient,
                unscaled_outcome_shares_received
            ));
        }
        Ok(amount)
    }

    // Sell the amount of shares, using the USD amount, returning the shares
    // sold. Does the transferring.
    pub fn internal_amm_burn(&mut self, outcome_id: FixedBytes<8>, fusdc_amount: U256) -> R<U256> {
        for outcome_id in self.outcome_ids_iter().collect::<Vec<_>>() {
            {
                let shares = self
                    .amm_shares
                    .get(outcome_id)
                    .checked_sub(fusdc_amount)
                    .ok_or(Error::CheckedSubOverflow)?;
                self.amm_shares.setter(outcome_id).set(shares);
            }
            {
                let total_shares = self
                    .amm_total_shares
                    .get(outcome_id)
                    .checked_sub(fusdc_amount)
                    .ok_or(Error::CheckedSubOverflow)?;
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
                / product,
        );
        let shares = self.amm_shares.get(outcome_id) - outcome_previous_shares;
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
        Ok(shares)
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
        Ok(share_bal)
    }
}
