use stylus_sdk::alloy_primitives::{aliases::*, *};

use crate::{error::*, fusdc_call, utils::msg_sender};

use alloc::vec::Vec;

// This exports user_entrypoint, which we need to have the entrypoint code.
pub use crate::storage_trading::*;

#[cfg_attr(feature = "contract-trading-mint", stylus_sdk::prelude::public)]
impl StorageTrading {
    #[allow(clippy::too_many_arguments)]
    #[allow(non_snake_case)]
    pub fn mint_permit_E_90275_A_B(
        &mut self,
        outcome: FixedBytes<8>,
        value: U256,
        recipient: Address,
        deadline: U256,
        v: u8,
        r: FixedBytes<32>,
        s: FixedBytes<32>,
    ) -> R<U256> {
        self.require_not_done_predicting()?;
        if deadline.is_zero() {
            c!(fusdc_call::take_from_sender(value));
        } else {
            c!(fusdc_call::take_from_sender_permit(
                value, deadline, v, r, s
            ))
        }
        #[cfg(feature = "trading-backend-dpm")]
        return self.internal_dpm_mint(outcome, value, recipient);
        #[cfg(not(feature = "trading-backend-dpm"))]
        return self.internal_amm_mint(outcome, value, recipient);
    }

    #[allow(clippy::too_many_arguments)]
    #[allow(non_snake_case)]
    pub fn burn_permit(
        &mut self,
        _outcome: FixedBytes<8>,
        fusdc_amount: U256,
        recipient: Address,
    ) -> R<U256> {
        self.require_not_done_predicting()?;
        fusdc_call::transfer(recipient, fusdc_amount)?;
        #[cfg(feature = "trading-backend-dpm")]
        unimplemented!();
        #[cfg(not(feature = "trading-backend-dpm"))]
        return self.internal_amm_burn(_outcome, fusdc_amount);
    }

    #[allow(non_snake_case)]
    pub fn payoff_91_F_A_8_C_2_E(
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

    pub fn add_liquidity_permit(
        &mut self,
        amount: U256,
        recipient: Address,
        deadline: U256,
        v: u8,
        r: FixedBytes<32>,
        s: FixedBytes<32>,
    ) -> R<(U256, Vec<(FixedBytes<8>, U256)>)> {
        self.require_not_done_predicting()?;
        if deadline.is_zero() {
            c!(fusdc_call::take_from_sender(amount));
        } else {
            c!(fusdc_call::take_from_sender_permit(
                amount, deadline, v, r, s
            ))
        }
        self.internal_amm_add_liquidity(amount, recipient)
    }

    pub fn remove_liquidity(
        &mut self,
        amount_liq: U256,
        recipient: Address,
    ) -> R<(U256, Vec<(FixedBytes<8>, U256)>)> {
        self.require_not_done_predicting()?;
        assert_or!(!amount_liq.is_zero(), Error::ZeroShares);
        assert_or!(
            self.amm_user_liquidity_shares.get(msg_sender()) >= amount_liq,
            Error::NotEnoughLiquidity
        );
        let (fusdc_amt, shares_received) =
            self.internal_amm_remove_liquidity(amount_liq, recipient)?;
        fusdc_call::transfer(recipient, fusdc_amt)?;
        Ok((fusdc_amt, shares_received))
    }

    pub fn claim_liquidity(&mut self, _recipient: Address) -> R<U256> {
        #[cfg(not(feature = "trading-backend-dpm"))]
        return self.internal_amm_claim_liquidity(_recipient);
        #[cfg(feature = "trading-backend-dpm")]
        unimplemented!()
    }
}

#[cfg(feature = "testing")]
impl StorageTrading {
    #[mutants::skip]
    pub fn mint_test(
        &mut self,
        outcome: FixedBytes<8>,
        value: U256,
        recipient: Address,
    ) -> R<U256> {
        self.mint_permit_E_90275_A_B(
            outcome,
            value,
            recipient,
            U256::ZERO,
            0,
            FixedBytes::ZERO,
            FixedBytes::ZERO,
        )
    }
}
