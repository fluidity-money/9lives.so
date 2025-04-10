use stylus_sdk::alloy_primitives::{aliases::*, *};

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
            return Ok(U256::ZERO);
        }
        self.internal_dpm_price(id)
    }
}

impl StorageTrading {
    pub fn internal_dpm_price(&self, id: FixedBytes<8>) -> R<U256> {
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
}
