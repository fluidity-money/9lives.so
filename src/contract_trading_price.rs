use stylus_sdk::alloy_primitives::{aliases::*, *};

use rust_decimal::Decimal;

use crate::{
    decimal::{fusdc_decimal_to_u256, fusdc_u256_to_decimal, share_u256_to_decimal},
    error::*,
    immutables::*,
    maths,
};

pub use crate::storage_trading::*;

#[cfg_attr(feature = "contract-trading-price", stylus_sdk::prelude::public)]
impl StorageTrading {
    #[allow(clippy::too_many_arguments)]
    #[allow(non_snake_case)]
    pub fn price_A_827_E_D_27(&self, id: FixedBytes<8>) -> R<U256> {
        if !self.when_decided.is_zero() {
            return Ok(U256::ZERO);
        }
        #[cfg(feature = "trading-backend-dpm")]
        return self.internal_dpm_price(id);
        #[cfg(not(feature = "trading-backend-dpm"))]
        return self.internal_amm_price(id);
    }
}

impl StorageTrading {
    #[allow(unused)]
    fn internal_dpm_price(&self, id: FixedBytes<8>) -> R<U256> {
        if self.outcome_invested.get(id).is_zero() {
            return Ok(U256::ZERO);
        }
        let m_1 = c!(fusdc_u256_to_decimal(self.outcome_invested.get(id)));
        let n_1 = self.outcome_shares.get(id);
        let n_2 = c!(share_u256_to_decimal(c!(self
            .global_shares
            .get()
            .checked_sub(n_1)
            .ok_or(Error::CheckedSubOverflow))));
        let n_1 = c!(share_u256_to_decimal(n_1));
        let m_2 = c!(fusdc_u256_to_decimal(c!(self
            .global_invested
            .get()
            .checked_sub(self.outcome_invested.get(id))
            .ok_or(Error::CheckedSubOverflow))));
        fusdc_decimal_to_u256(c!(maths::dpm_price(m_1, m_2, n_1, n_2, Decimal::ZERO)))
    }

    #[allow(unused)]
    fn internal_amm_price(&self, id: FixedBytes<8>) -> R<U256> {
        let outcome_list_len = self.outcome_list.len();
        let mut price_weight_sum = U256::ZERO;
        let mut price_weight_ours = None;
        //for i in range(len(self.shares)):
        for i in 0..outcome_list_len {
            //product = 1
            let mut product = U256::from(1);
            //for j in range(len(self.shares)):
            for j in 0..outcome_list_len {
                let o = self.outcome_list.get(j).unwrap();
                //if i != j:
                if i != j {
                    //product *= self.shares[j]
                    product = c!(product
                        .checked_mul(self.outcome_shares.get(o))
                        .ok_or(Error::CheckedMulOverflow));
                }
            }
            product = product
                .checked_div(SHARE_DECIMALS_EXP)
                .ok_or(Error::CheckedDivOverflow)?;
            //outcome_price_weights.append(product)
            price_weight_sum = c!(price_weight_sum
                .checked_add(product)
                .ok_or(Error::CheckedAddOverflow));
            // Stylus will memoise this access for us so we can cheaply do this.
            if self.outcome_list.get(i).unwrap() == id {
                price_weight_ours = Some(product);
            }
        }
        //outcome_price_weights[k] / price_weight_of_all_outcomes
        Ok(c!(c!(price_weight_ours.ok_or(Error::NonexistentOutcome))
            .checked_mul(SHARE_DECIMALS_EXP)
            .ok_or(Error::CheckedDivOverflow))
            / price_weight_sum)
    }
}
