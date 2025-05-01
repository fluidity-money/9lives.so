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

#[cfg(feature = "contract-trading-mint")]
use alloc::vec::Vec;

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
        let value = value
            .checked_sub(self.calculate_and_set_fees(value, referrer)?)
            .ok_or(Error::CheckedSubOverflow)?;
        #[cfg(feature = "trading-backend-dpm")]
        return self.internal_dpm_mint(outcome, value, recipient);
        #[cfg(not(feature = "trading-backend-dpm"))]
        return self.internal_amm_mint(outcome, value, recipient);
    }

    /// Burn, preventing us from blowing past and below the amounts given.
    /// Used by burn by shares as well. Returns the shares burned.
    #[allow(clippy::too_many_arguments)]
    #[allow(non_snake_case)]
    pub fn burn_9_C_54_A_443(
        &mut self,
        _outcome: FixedBytes<8>,
        fusdc_amount: U256,
        _min_shares: U256,
        referrer: Address,
        recipient: Address,
    ) -> R<U256> {
        self.require_not_done_predicting()?;
        #[cfg(feature = "trading-backend-dpm")]
        return Err(Error::AMMOnly);
        #[cfg(not(feature = "trading-backend-dpm"))]
        {
            let (burned_shares, fusdc_to_return) =
                self.internal_amm_burn(_outcome, fusdc_amount, _min_shares, referrer)?;
            fusdc_call::transfer(recipient, fusdc_to_return)?;
            evm::log(events::SharesBurned {
                identifier: _outcome,
                shareAmount: burned_shares,
                spender: msg_sender(),
                recipient,
                fusdcReturned: fusdc_to_return,
            });
            Ok(burned_shares)
        }
    }

    #[allow(non_snake_case)]
    pub fn estimate_burn_F_F_C_E_B_F_F_5(&self, _outcome: FixedBytes<8>, _shares: U256) -> R<U256> {
        if !self.when_decided.get().is_zero() {
            return Ok(U256::ZERO);
        }
        #[cfg(feature = "trading-backend-dpm")]
        return Err(Error::AMMOnly);
        #[cfg(not(feature = "trading-backend-dpm"))]
        return self.internal_amm_estimate_burn(_outcome, _shares);
    }

    /// Burn a number of shares by using binary search to estimate the amount
    /// of fUSDC to take. Returns the shares burned and the fUSDC returned.
    #[allow(clippy::too_many_arguments)]
    #[allow(non_snake_case)]
    pub fn burn_by_shares_9_F_3_C_B_274(
        &mut self,
        _outcome: FixedBytes<8>,
        _max_shares: U256,
        _min_shares: U256,
        _referrer: Address,
        _recipient: Address,
    ) -> R<(U256, U256)> {
        #[cfg(feature = "trading-backend-dpm")]
        return Err(Error::AMMOnly);
        #[cfg(not(feature = "trading-backend-dpm"))]
        {
            let fusdc_returned = self.internal_amm_estimate_burn(_outcome, _max_shares)?;
            return Ok((
                self.burn_9_C_54_A_443(
                    _outcome,
                    fusdc_returned,
                    _min_shares,
                    _referrer,
                    _recipient,
                )?,
                fusdc_returned,
            ));
        }
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
