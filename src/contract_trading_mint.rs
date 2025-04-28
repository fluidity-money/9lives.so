use stylus_sdk::{
    alloy_primitives::{aliases::*, *},
    evm,
};

use crate::{
    decimal::MAX_UINT256,
    error::*,
    events, fusdc_call,
    immutables::*,
    utils::{block_timestamp, msg_sender},
};

// This exports user_entrypoint, which we need to have the entrypoint code.
pub use crate::storage_trading::*;

#[cfg_attr(feature = "contract-trading-mint", stylus_sdk::prelude::public)]
impl StorageTrading {
    #[allow(clippy::too_many_arguments)]
    #[allow(non_snake_case)]
    pub fn mint_permit_243_E_E_C_56(
        &mut self,
        outcome: FixedBytes<8>,
        value: U256,
        referrer: Address,
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
        assert_or!(value < MAX_UINT256, Error::U256TooLarge);
        assert_or!(!value.is_zero(), Error::ZeroAmount);
        let recipient = if recipient.is_zero() {
            msg_sender()
        } else {
            recipient
        };
        // If we're within 3 hours left on the trading of this contract,
        // we want to delay the finale by 3 hours, but only if that's behaviour
        // that we want.
        if self.should_buffer_time.get() {
            let old_time_ending = self.time_ending.get();
            if old_time_ending - U64::from(block_timestamp()) < THREE_HOURS_SECS {
                let new_time_ending = old_time_ending + THREE_HOURS_SECS;
                self.time_ending.set(U64::from(new_time_ending));
                evm::log(events::DeadlineExtension {
                    timeBefore: u64::from_le_bytes(old_time_ending.to_le_bytes()),
                    timeAfter: u64::from_le_bytes(new_time_ending.to_le_bytes()),
                });
            }
        }
        // Set the fees, including the AMM helper ones.
        let value = self.calculate_and_set_fees(value, referrer)?;
        #[cfg(feature = "trading-backend-dpm")]
        return self.internal_dpm_mint(outcome, value, recipient);
        #[cfg(not(feature = "trading-backend-dpm"))]
        return self.internal_amm_mint(outcome, value, recipient);
    }

    #[allow(clippy::too_many_arguments)]
    #[allow(non_snake_case)]
    pub fn burn_A_E_5853_F_A(
        &mut self,
        _outcome: FixedBytes<8>,
        fusdc_amount: U256,
        _min_shares: U256,
        recipient: Address,
    ) -> R<U256> {
        self.require_not_done_predicting()?;
        fusdc_call::transfer(recipient, fusdc_amount)?;
        #[cfg(feature = "trading-backend-dpm")]
        unimplemented!();
        #[cfg(not(feature = "trading-backend-dpm"))]
        return self.internal_amm_burn(_outcome, fusdc_amount, _min_shares, recipient);
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
        self.mint_permit_243_E_E_C_56(
            outcome,
            value,
            Address::ZERO,
            recipient,
            U256::ZERO,
            0,
            FixedBytes::ZERO,
            FixedBytes::ZERO,
        )
    }
}
