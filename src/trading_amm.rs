use crate::{maths, error::*, storage_trading::*};

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
        let previous_shares = self
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
        // Recompute shares to preserve price ratios.
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
        let liquidity = maths::pow_frac(product, 1, self.outcome_list.len() as u32);
        // Time to mint the user some shares!
        Ok(U256::ZERO)
    }
}
