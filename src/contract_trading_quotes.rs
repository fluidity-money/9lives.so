use stylus_sdk::{
    alloy_primitives::{aliases::*, *},
    evm,
};

use crate::{
    decimal::{fusdc_u256_to_decimal, share_decimal_to_u256, share_u256_to_decimal},
    error::*,
    events, fusdc_call, maths,
    utils::msg_sender,
};

pub use crate::storage_trading::*;

#[cfg(feature = "contract-trading-quotes")]
use alloc::vec::Vec;

#[cfg_attr(feature = "contract-trading-quotes", stylus_sdk::prelude::public)]
impl StorageTrading {
    #[allow(non_snake_case)]
    pub fn quote_C_0_E_17_F_C_7(&self, outcome_id: FixedBytes<8>, value: U256) -> R<U256> {
        if !self.when_decided.get().is_zero() {
            return Ok(U256::ZERO);
        }
        #[cfg(feature = "trading-backend-dpm")]
        return self.internal_dpm_quote(outcome_id, value);
        #[cfg(not(feature = "trading-backend-dpm"))]
        return self.internal_amm_quote_mint(outcome_id, value);
    }

    /// Quote the amount of shares that would be received for burning the
    /// fUSDC amount given. Inclusive of fees.
    #[allow(non_snake_case)]
    pub fn estimate_burn_C_04425_D_3(&self, _outcome_id: FixedBytes<8>, _value: U256) -> R<U256> {
        if !self.when_decided.get().is_zero() {
            return Ok(U256::ZERO);
        }
        #[cfg(feature = "trading-backend-dpm")]
        return Err(Error::AMMOnly);
        #[cfg(not(feature = "trading-backend-dpm"))]
        return self.internal_amm_estimate_burn(_outcome_id, _value);
    }

    #[allow(non_snake_case)]
    pub fn claim_address_fees_70938_D_8_B(&mut self, recipient: Address) -> R<U256> {
        let owed = self.fees_owed_addresses.get(msg_sender());
        fusdc_call::transfer(recipient, owed)?;
        self.fees_owed_addresses
            .setter(msg_sender())
            .set(U256::ZERO);
        evm::log(events::AddressFeesClaimed {
            recipient,
            amount: owed,
        });
        Ok(owed)
    }

    #[allow(non_snake_case)]
    pub fn payoff_8_5_D_8_D_F_C_9(
        &mut self,
        outcome_id: FixedBytes<8>,
        amt: U256,
        recipient: Address,
    ) -> R<U256> {
        #[cfg(feature = "trading-backend-dpm")]
        return self.internal_dpm_payoff(outcome_id, amt, recipient);
        #[cfg(not(feature = "trading-backend-dpm"))]
        return self.internal_amm_payoff(outcome_id, amt, recipient);
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
        let m_1 = c!(fusdc_u256_to_decimal(
            self.dpm_outcome_invested.get(outcome_id)
        ));
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
