use stylus_sdk::{
    alloy_primitives::{aliases::*, *},
    evm,
};

use crate::{
    decimal::{fusdc_u256_to_decimal, share_decimal_to_u256, share_u256_to_decimal, MAX_UINT256},
    error::*,
    events,
    fees::*,
    fusdc_call,
    immutables::*,
    maths, proxy, share_call,
    utils::{block_timestamp, contract_address, msg_sender},
};

use crate::decimal::fusdc_decimal_to_u256;

use rust_decimal::Decimal;

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
        self.internal_dpm_mint_permit(outcome, vaule, recipient, deadline, v, r, s)
    }

    #[allow(non_snake_case)]
    pub fn payoff_91_F_A_8_C_2_E(
        &mut self,
        outcome_id: FixedBytes<8>,
        amt: U256,
        recipient: Address,
    ) -> R<U256> {
        self.internal_dpm_payoff(outcome_id, amt, recipient)
    }

    #[allow(non_snake_case)]
    pub fn payoff_quote_1_F_A_6_D_C_28(&self, outcome_id: FixedBytes<8>, amt: U256) -> R<U256> {
        self.internal_dpm_payoff(outcome_id, amt)
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
