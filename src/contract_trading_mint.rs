use stylus_sdk::{
    alloy_primitives::{aliases::*, *},
    evm,
};

use crate::{
    error::*,
    events, fusdc_call,
    immutables::THREE_HOURS_SECS,
    utils::{block_timestamp, msg_sender},
};

#[cfg(not(feature = "trading-backend-dppm"))]
use crate::immutables;

// This exports user_entrypoint, which we need to have the entrypoint code.
pub use crate::storage_trading::*;

#[cfg(feature = "contract-trading-mint")]
use alloc::vec::Vec;

#[cfg_attr(feature = "contract-trading-mint", stylus_sdk::prelude::public)]
impl StorageTrading {
    #[allow(clippy::too_many_arguments)]
    #[allow(non_snake_case)]
    pub fn mint_8_A_059_B_6_E(
        &mut self,
        outcome: FixedBytes<8>,
        value: U256,
        referrer: Address,
        recipient: Address,
    ) -> R<U256> {
        self.require_not_done_predicting()?;
        c!(fusdc_call::take_from_sender(value));
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
        let fees = self.calculate_and_set_fees(value, true, referrer)?;
        let value = value.checked_sub(fees).ok_or(Error::MintAmountTooLow)?;
        #[cfg(feature = "trading-backend-dppm")]
        return self.internal_dppm_mint(outcome, value, recipient);
        #[cfg(not(feature = "trading-backend-dppm"))]
        return self.internal_amm_mint(outcome, value, recipient);
    }

    /// Burn, preventing us from blowing past and below the amounts given.
    /// Can optionally burn shares as well by way of estimation.
    // Returns the shares burned, and the fUSDC being returned.
    #[allow(clippy::too_many_arguments)]
    #[allow(non_snake_case)]
    pub fn burn_854_C_C_96_E(
        &mut self,
        _outcome: FixedBytes<8>,
        _amount: U256,
        _should_estimate_shares_burn: bool,
        _min_shares: U256,
        _referrer: Address,
        _recipient: Address,
    ) -> R<(U256, U256)> {
        self.require_not_done_predicting()?;
        #[cfg(feature = "trading-backend-dppm")]
        return Err(Error::AMMOnly);
        #[cfg(not(feature = "trading-backend-dppm"))]
        {
            let fusdc = if _should_estimate_shares_burn {
                self.internal_amm_estimate_burn(_outcome, _amount)?
            } else {
                _amount
            };
            // If the paymaster was the one to submit this transaction, then we can
            // assume that the recipient was the true sender of the signed blob.
            let (burned_shares, fusdc_to_return) = self.internal_amm_burn(
                match msg_sender() {
                    immutables::PAYMASTER_ADDR => _recipient,
                    _ => msg_sender(),
                },
                _outcome,
                fusdc,
                _min_shares,
                _referrer,
            )?;
            fusdc_call::transfer(_recipient, fusdc_to_return)?;
            evm::log(events::SharesBurned {
                identifier: _outcome,
                shareAmount: burned_shares,
                spender: msg_sender(),
                recipient: _recipient,
                fusdcReturned: fusdc_to_return,
            });
            Ok((burned_shares, fusdc_to_return))
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
        self.mint_8_A_059_B_6_E(outcome, value, Address::ZERO, recipient)
    }
}
