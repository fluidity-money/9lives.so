use stylus_sdk::alloy_primitives::{aliases::*, *};

use crate::{
    decimal::{fusdc_u256_to_decimal, share_decimal_to_u256, share_u256_to_decimal},
    error::*,
    maths,
};

pub use crate::storage_trading::*;

#[cfg_attr(feature = "contract-trading-quotes", stylus_sdk::prelude::public)]
impl StorageTrading {
    #[allow(non_snake_case)]
    pub fn quote_C_0_E_17_F_C_7(&self, outcome_id: FixedBytes<8>, value: U256) -> R<U256> {
        if !self.when_decided.is_zero() {
            return Ok(U256::ZERO);
        }
        assert_or!(
            self.outcome_shares.get(outcome_id) > U256::ZERO,
            Error::NonexistentOutcome
        );
        #[cfg(feature = "trading-backend-dpm")]
        return self.internal_dpm_quote(outcome_id, value);
        #[cfg(not(feature = "trading-backend-dpm"))]
        return self.internal_amm_quote(outcome_id, value);
    }
}

impl StorageTrading {
    #[allow(unused)]
    fn internal_dpm_quote(&self, outcome_id: FixedBytes<8>, value: U256) -> R<U256> {
        let m_1 = c!(fusdc_u256_to_decimal(self.outcome_invested.get(outcome_id)));
        let n_1 = self.outcome_shares.get(outcome_id);
        let n_2 = self.global_shares.get() - n_1;
        let n_1 = c!(share_u256_to_decimal(n_1));
        let n_2 = c!(share_u256_to_decimal(n_2));
        let m_2 = c!(fusdc_u256_to_decimal(
            self.global_invested.get() - self.outcome_invested.get(outcome_id),
        ));
        Ok(c!(share_decimal_to_u256(c!(maths::dpm_shares(
            m_1,
            m_2,
            n_1,
            n_2,
            c!(fusdc_u256_to_decimal(value))
        )))))
    }

    #[allow(unused)]
    fn internal_amm_quote(&self, outcome_id: FixedBytes<8>, value: U256) -> R<U256> {
        let mut product = U256::from(1);
        let outcome_list_len = self.outcome_list.len();
        let mut our_shares = U256::ZERO;
        for i in 0..outcome_list_len {
            let o = self.outcome_list.get(i).unwrap();
            let outcome_shares = self.outcome_shares.get(o);
            let shares = c!(outcome_shares
                .checked_add(value)
                .ok_or(Error::CheckedAddOverflow));
            if o == outcome_id {
                our_shares = shares;
            }
            product = c!(product.checked_mul(shares).ok_or(Error::CheckedMulOverflow));
        }
        product = c!(product
            .checked_div(our_shares)
            .ok_or(Error::CheckedDivOverflow));
        //self.shares[outcome] = (self.liquidity ** self.outcomes) / product
        let shares = c!(c!(self
            .seed_invested
            .get()
            .checked_pow(U256::from(self.outcome_list.len()))
            .ok_or(Error::CheckedPowOverflow))
        .checked_div(product)
        .ok_or(Error::CheckedDivOverflow));
        Ok(shares)
    }
}
