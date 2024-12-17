use stylus_sdk::{
    alloy_primitives::{aliases::*, *},
     evm,
};

use crate::{
    decimal::{fusdc_u256_to_decimal, share_decimal_to_u256, share_u256_to_decimal},
    error::*,
    events,
    fees::*,
    fusdc_call,
    immutables::*,
    maths, proxy, share_call,
    utils::{contract_address, block_timestamp, msg_sender},
};

#[cfg(feature = "trading-backend-dpm")]
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
        if deadline.is_zero() {
            fusdc_call::take_from_sender(value)?;
        } else {
            fusdc_call::take_from_sender_permit(value, deadline, v, r, s)?;
        }
        self.internal_mint(outcome, value, recipient)
    }

    #[allow(non_snake_case)]
    pub fn payoff_91_F_A_8_C_2_E(
        &mut self,
        outcome_id: FixedBytes<8>,
        amt: U256,
        recipient: Address,
    ) -> R<U256> {
        assert_or!(self.winner.get() == outcome_id, Error::NotWinner);
        // Get the user's balance of the share they own for this outcome.
        let share_addr = proxy::get_share_addr(
            self.factory_addr.get(),
            contract_address(), // Address of this contract, the Trading contract.
            self.share_impl.get(),
            outcome_id,
        );
        // Start to burn their share of the supply to convert to a payoff amount.
        // Take the max of what they asked.
        let share_bal = U256::min(share_call::balance_of(share_addr, msg_sender())?, amt);
        assert_or!(share_bal > U256::ZERO, Error::ZeroShares);
        share_call::burn(share_addr, msg_sender(), share_bal)?;
        #[cfg(feature = "trading-backend-dpm")]
        let fusdc = fusdc_decimal_to_u256(maths::dpm_payoff(
            share_u256_to_decimal(share_bal)?,
            share_u256_to_decimal(self.outcome_shares.get(outcome_id))?,
            fusdc_u256_to_decimal(self.global_invested.get())?,
        )?)?;
        // This should be $1!
        #[cfg(not(feature = "trading-backend-dpm"))]
        let fusdc = self.global_invested.get() / self.outcome_shares.get(outcome_id);
        fusdc_call::transfer(recipient, fusdc)?;
        evm::log(events::PayoffActivated {
            identifier: outcome_id,
            sharesSpent: share_bal,
            spender: msg_sender(),
            recipient,
            fusdcReceived: fusdc,
        });
        Ok(fusdc)
    }
}

impl StorageTrading {
    // Shares returned by the DPM. Does not set any state.
    #[allow(unused)]
    fn internal_dpm_mint(&self, outcome_id: FixedBytes<8>, value: U256) -> R<U256> {
        let n_1 = self.outcome_shares.get(outcome_id);
        let outcome_invested = self.outcome_invested.get(outcome_id);
        let m = fusdc_u256_to_decimal(value)?;
        // Prevent them from taking less than the minimum amount to LP with.
        assert_or!(m > Decimal::from(MINIMUM_MINT_AMT), Error::TooSmallNumber);
        let m_1 = fusdc_u256_to_decimal(outcome_invested)?;
        let n_2 = self.global_shares.get() - n_1;
        let n_1 = share_u256_to_decimal(n_1)?;
        let m_2 = fusdc_u256_to_decimal(self.global_invested.get() - outcome_invested)?;
        let n_2 = share_u256_to_decimal(n_2)?;
        share_decimal_to_u256(maths::dpm_shares(m_1, m_2, n_1, n_2, m)?)
    }

    /// Calculate the AMM amount of shares you would receive. Sets the
    /// shares for each outcome in the outcomes list during its operation.
    #[allow(unused)]
    fn internal_amm_mint(&mut self, outcome_id: FixedBytes<8>, value: U256) -> R<U256> {
        let mut product = U256::from(1);
        let outcome_list_len = self.outcome_list.len();
        /*
        for i in range(len(self.shares)):
            self.shares[i] += amount
            product = product.checked_mul(self.shares[i]).ok_or(Error::CheckedMulOverflow)?;
            self.total_shares[i] += amount
        */
        for i in 0..outcome_list_len {
            let o = self.outcome_list.get(i).unwrap();
            let outcome_shares = self.outcome_shares.get(o);
            self.outcome_shares.setter(o).set(
                outcome_shares
                    .checked_add(value)
                    .ok_or(Error::CheckedAddOverflow)?,
            );
            product = product
                .checked_mul(self.outcome_shares.get(o))
                .ok_or(Error::CheckedMulOverflow)?;
        }
        let shares_before = self.outcome_shares.get(outcome_id);
        product = product
            .checked_div(self.outcome_shares.get(outcome_id))
            .ok_or(Error::CheckedDivOverflow)?;
        //self.shares[outcome] = (self.liquidity ** self.outcomes) / product
        let shares = self
            .seed_invested
            .get()
            .checked_pow(U256::from(self.outcome_list.len()))
            .ok_or(Error::CheckedPowOverflow)?
            .checked_div(product)
            .ok_or(Error::CheckedDivOverflow)?;
        self.outcome_shares.setter(outcome_id).set(shares);
        //self.user_shares = self.shares_before - self.shares[outcome]
        shares_before
            .checked_sub(shares)
            .ok_or(Error::CheckedSubOverflow)
    }

    fn internal_mint(
        &mut self,
        outcome_id: FixedBytes<8>,
        value: U256,
        recipient: Address,
    ) -> R<U256> {
        // Ensure that we're not complete, and that the time hasn't expired.
        assert_or!(
            self.when_decided.get().is_zero()
                || self.is_shutdown.get()
                || self.time_ending.get() > U64::from(block_timestamp()),
            Error::DoneVoting
        );
        assert_or!(value > U256::ZERO, Error::ZeroAmount);
        let recipient = if recipient.is_zero() {
            msg_sender()
        } else {
            recipient
        };
        // Make sure that the outcome exists.
        assert_or!(
            self.outcome_shares.get(outcome_id) > U256::ZERO,
            Error::NonexistentOutcome
        );
        // If we're within 3 hours left on the trading of this contract,
        // we want to delay the finale by 3 hours.
        {
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
        // Here we do some fee adjustment to send the fee recipient their money.
        let fee_for_creator = (value * FEE_CREATOR_MINT_PCT) / FEE_SCALING;
        fusdc_call::transfer(self.fee_recipient.get(), fee_for_creator)?;
        // Collect some fees for the team (for moderation reasons for screening).
        let fee_for_team = (value * FEE_SPN_MINT_PCT) / FEE_SCALING;
        let value = value - fee_for_creator - fee_for_team;
        // Set the global amounts that were invested.
        let outcome_invested_before = self.outcome_invested.get(outcome_id);
        self.outcome_invested.setter(outcome_id).set(
            outcome_invested_before
                .checked_add(value)
                .ok_or(Error::CheckedAddOverflow)?,
        );
        self.global_invested.set(
            self.global_invested
                .get()
                .checked_add(value)
                .ok_or(Error::CheckedAddOverflow)?,
        );
        // We need to increase by the amount we allocate, the AMM should do that
        // internally. Some extra fields are needed for the DPM's calculations.
        #[cfg(feature = "trading-backend-dpm")]
        let shares = {
            let shares_before = self.outcome_shares.get(outcome_id);
            let shares = self.internal_dpm_mint(outcome_id, value)?;
            self.outcome_shares.setter(outcome_id).set(
                shares_before
                    .checked_add(shares)
                    .ok_or(Error::CheckedAddOverflow)?,
            );
            self.global_shares.set(
                self.global_shares
                    .get()
                    .checked_add(shares)
                    .ok_or(Error::CheckedAddOverflow)?,
            );
            shares
        };
        // This function is needing to be used this way, since it is side effect heavy.
        // Internally it will set variables including the global shares count.
        // We take the difference between the shares that already existed, and ours
        // now, to get the correct number.
        #[cfg(not(feature = "trading-backend-dpm"))]
        let shares = self.internal_amm_mint(outcome_id, value)?;
        // Get the address of the share, then mint some in line with the
        // shares we made to the user's address!
        let share_addr = proxy::get_share_addr(
            self.factory_addr.get(),
            contract_address(),
            self.share_impl.get(),
            outcome_id,
        );
        assert_or!(shares > U256::ZERO, Error::UnusualAmountCreated);
        share_call::mint(share_addr, recipient, shares)?;

        evm::log(events::SharesMinted {
            identifier: outcome_id,
            shareAmount: shares,
            spender: msg_sender(),
            recipient,
            fusdcSpent: value,
        });

        Ok(shares)
    }
}

#[cfg(feature = "testing")]
impl StorageTrading {
    pub fn test_dpm_mint(&mut self, _outcome_id: FixedBytes<8>, _value: U256) -> U256 {
        self.internal_dpm_mint(_outcome_id, _value).unwrap()
    }

    pub fn test_amm_mint(&mut self, _outcome_id: FixedBytes<8>, _value: U256) -> U256 {
        self.internal_amm_mint(_outcome_id, _value).unwrap()
    }

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
