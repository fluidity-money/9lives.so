use crate::{
    error::*,
    maths, proxy, share_call,
    storage_trading::*,
    utils::{contract_address, msg_sender},
};

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
                    .fold(U256::from(1), |product, other_id| {
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
                self.amm_outcome_prices
                    .setter(id)
                    .set(outcome_price_weights[i] / price_weight_of_all_outcomes);
            }
        }
    }

    pub fn internal_amm_add_liquidity(&mut self, amount: U256, recipient: Address) -> R<U256> {
        self.require_not_done_predicting()?;
        self.internal_amm_get_prices();
        let prev_liquidity = self.amm_liquidity.get();
        for id in self.outcome_ids_iter().collect::<Vec<_>>() {
            let x = self.amm_shares.get(id);
            self.amm_shares.setter(id).set(x + amount);
            let x = self.amm_total_shares.get(id);
            self.amm_total_shares.setter(id).set(x + amount);
        }
        let prev_shares = self
            .outcome_ids_iter()
            .map(|x| self.amm_shares.get(x))
            .collect::<Vec<_>>();
        // There should always be an answer here! We don't allow someone to set
        // up with no outcomes.
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
        // Recompute shares to preserve price ratios. This is not inclusive of least indices!
        for outcome_id in self.outcome_ids_iter().collect::<Vec<_>>() {
            if self.amm_shares.get(outcome_id) == least_likely_amt {
                continue;
            }
            let new_shares = (self.amm_shares.get(least_likely_outcome_id)
                * self.amm_outcome_prices.get(least_likely_outcome_id))
                / self.amm_outcome_prices.get(outcome_id);
            self.amm_shares.setter(outcome_id).set(new_shares);
        }
        let product = self
            .outcome_ids_iter()
            .map(|x| self.amm_shares.get(x))
            .product();
        self.amm_liquidity
            .set(maths::pow_frac(product, 1, self.outcome_list.len() as u32));
        // Time to mint the user some shares. For now, we're going to simply bump
        // their balance.
        let add_user_liq = self.amm_liquidity.get() - prev_liquidity;
        {
            let user_liq_shares = self.amm_user_liquidity_shares.get(recipient);
            self.amm_user_liquidity_shares
                .setter(recipient)
                .set(user_liq_shares + add_user_liq);
        }
        for (i, outcome_id) in self.outcome_ids_iter().enumerate() {
            let outcome_shares_received = prev_shares[i] - self.amm_shares.get(outcome_id);
            c!(share_call::mint(
                proxy::get_share_addr(
                    self.factory_addr.get(),
                    contract_address(),
                    self.share_impl.get(),
                    outcome_id,
                ),
                recipient,
                outcome_shares_received
            ));
        }
        Ok(amount)
    }

    pub fn internal_amm_remove_liquidity(&mut self, amount: U256, recipient: Address) -> R<U256> {
        self.require_not_done_predicting()?;
        self.internal_amm_get_prices();
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
        let (_, most_likely_outcome_id) = self
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
        // This is the amount of fUSDC to return to the end user.
        let liquidity_shares_val =
            self.amm_liquidity.get() / self.amm_shares.get(least_likely_outcome_id) * amount;
        for outcome_id in self.outcome_ids_iter().collect::<Vec<_>>() {
            {
                let shares = self.amm_shares.get(outcome_id) - liquidity_shares_val;
                self.amm_shares.setter(outcome_id).set(shares);
            }
            {
                let total_shares = self.amm_total_shares.get(outcome_id) - liquidity_shares_val;
                self.amm_total_shares.setter(outcome_id).set(total_shares);
            }
        }
        let prev_shares = self
            .outcome_ids_iter()
            .map(|x| self.amm_shares.get(x))
            .collect::<Vec<_>>();
        // Recompute shares to preserve price ratios. This is not inclusive of least indices!
        for outcome_id in self.outcome_ids_iter().collect::<Vec<_>>() {
            if self.amm_shares.get(outcome_id) == least_likely_amt {
                continue;
            }
            let new_shares = (self.amm_shares.get(most_likely_outcome_id)
                * self.amm_outcome_prices.get(most_likely_outcome_id))
                / self.amm_outcome_prices.get(outcome_id);
            self.amm_shares.setter(outcome_id).set(new_shares);
        }
        let product = self
            .outcome_ids_iter()
            .map(|x| self.amm_shares.get(x))
            .product();
        self.amm_liquidity
            .set(maths::pow_frac(product, 1, self.outcome_list.len() as u32));
        {
            let user_liq_shares = self.amm_user_liquidity_shares.get(msg_sender());
            self.amm_user_liquidity_shares
                .setter(msg_sender())
                .set(user_liq_shares - amount);
        }
        for (i, outcome_id) in self.outcome_ids_iter().enumerate() {
            let outcome_shares_received = prev_shares[i] - self.amm_shares.get(outcome_id);
            // TODO: should this be the burn function instead?
            c!(share_call::mint(
                proxy::get_share_addr(
                    self.factory_addr.get(),
                    contract_address(),
                    self.share_impl.get(),
                    outcome_id,
                ),
                recipient,
                outcome_shares_received
            ));
        }
        Ok(liquidity_shares_val)
    }

    pub fn internal_amm_buy(
        &mut self,
        outcome_id: FixedBytes<8>,
        amount: U256,
        recipient: Address,
    ) -> R<U256> {
        self.require_not_done_predicting()?;
        self.internal_amm_get_prices();
        for outcome_id in self.outcome_ids_iter().collect::<Vec<_>>() {
            {
                let shares = self.amm_shares.get(outcome_id) + amount;
                self.amm_shares.setter(outcome_id).set(shares);
            }
            {
                let total_shares = self.amm_total_shares.get(outcome_id) + amount;
                self.amm_total_shares.setter(outcome_id).set(total_shares);
            }
        }
        let our_previous_shares = self.amm_shares.get(outcome_id);
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
        let shares = our_previous_shares - self.amm_shares.get(outcome_id);
        c!(share_call::mint(
            proxy::get_share_addr(
                self.factory_addr.get(),
                contract_address(),
                self.share_impl.get(),
                outcome_id,
            ),
            recipient,
            shares
        ));
        Ok(shares)
    }
}
