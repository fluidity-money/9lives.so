use stylus_sdk::alloy_primitives::{aliases::*, *};

use hashbrown::HashMap;

use rust_decimal::Decimal;

use crate::{
    decimal::{fusdc_decimal_to_u256, fusdc_u256_to_decimal, share_u256_to_decimal},
    error::*,
    maths,
};

pub use crate::storage_trading::*;

#[cfg_attr(feature = "contract-trading-price", stylus_sdk::prelude::public)]
impl StorageTrading {
    #[allow(clippy::too_many_arguments)]
    #[allow(non_snake_case)]
    pub fn price_A_827_E_D_27(&self, id: FixedBytes<8>) -> R<U256> {
        if !self.when_decided.is_zero() {
            return ok(U256::ZERO);
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
        let m_1 = fusdc_u256_to_decimal(self.outcome_invested.get(id))?;
        let n_1 = self.outcome_shares.get(id);
        let n_2 = share_u256_to_decimal(
            self.global_shares
                .get()
                .checked_sub(n_1)
                .ok_or(Error::CheckedSubOverflow)?,
        )?;
        let n_1 = share_u256_to_decimal(n_1)?;
        let m_2 = fusdc_u256_to_decimal(
            self.global_invested
                .get()
                .checked_sub(self.outcome_invested.get(id))
                .ok_or(Error::CheckedSubOverflow)?,
        )?;
        fusdc_decimal_to_u256(maths::dpm_price(m_1, m_2, n_1, n_2, Decimal::ZERO)?)
    }

    #[allow(unused)]
    fn internal_amm_price(&self, id: FixedBytes<8>) -> R<U256> {
        let outcome_list_len = self.outcome_list.len();
        let mut price_weights = HashMap::new();
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
                    product = product
                        .checked_mul(self.outcome_shares.get(o))
                        .ok_or(Error::CheckedMulOverflow)?;
                }
            }
            //outcome_price_weights.append(product)
            price_weights.insert(self.outcome_list.get(i).unwrap(), product);
        }
        //outcome_price_weights[k] / price_weight_of_all_outcomes
        ok(price_weights.get(&id).unwrap() / price_weights.values().sum::<U256>())
    }
}
