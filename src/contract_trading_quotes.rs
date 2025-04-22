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
        #[cfg(feature = "trading-backend-dpm")]
        return self.internal_dpm_quote(outcome_id, value);
        #[cfg(not(feature = "trading-backend-dpm"))]
        return self.internal_amm_quote(outcome_id, value);
    }
}

impl StorageTrading {
    #[allow(unused)]
    #[mutants::skip]
    fn internal_dpm_quote(&self, outcome_id: FixedBytes<8>, value: U256) -> R<U256> {
        assert_or!(
            self.dpm_outcome_shares.get(outcome_id) > U256::ZERO,
            Error::NonexistentOutcome
        );
        let m_1 = c!(fusdc_u256_to_decimal(self.dpm_outcome_invested.get(outcome_id)));
        let n_1 = self.dpm_outcome_shares.get(outcome_id);
        let n_2 = self.dpm_global_shares.get() - n_1;
        let n_1 = c!(share_u256_to_decimal(n_1));
        let n_2 = c!(share_u256_to_decimal(n_2));
        let m_2 = c!(fusdc_u256_to_decimal(
            self.dpm_global_invested.get() - self.dpm_outcome_invested.get(outcome_id),
        ));
        Ok(c!(share_decimal_to_u256(c!(maths::dpm_shares(
            m_1,
            m_2,
            n_1,
            n_2,
            c!(fusdc_u256_to_decimal(value))
        )))))
    }
}
