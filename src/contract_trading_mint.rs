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

#[cfg(feature = "trading-backend-dpm")]
use crate::decimal::fusdc_decimal_to_u256;

use rust_decimal::Decimal;

#[cfg(target_arch = "wasm32")]
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
        assert_or!(value < MAX_UINT256, Error::U256TooLarge);
        if deadline.is_zero() {
            c!(fusdc_call::take_from_sender(value));
        } else {
            c!(fusdc_call::take_from_sender_permit(
                value, deadline, v, r, s
            ))
        }
        self.internal_adjust(
            outcome,
            I256::from_le_bytes(value.to_le_bytes::<32>()),
            recipient,
        )
    }

    #[allow(non_snake_case)]
    pub fn burn_permit_7045_A_604(
        &mut self,
        outcome: FixedBytes<8>,
        fusdc_amt: U256,
        _recipient: Address,
        deadline: U256,
        v: u8,
        r: FixedBytes<32>,
        s: FixedBytes<32>,
    ) -> R<U256> {
        //assert_or!(!fusdc_amt.is_zero(), Error::ZeroAmount);
        let share_addr = proxy::get_share_addr(
            self.factory_addr.get(),
            contract_address(), // Address of this contract, the Trading contract.
            self.share_impl.get(),
            outcome,
        );
        #[cfg(feature = "trading-backend-dpm")]
        return Err(Error::AMMOnly);
        #[cfg_attr(feature = "trading-backend-dpm", allow(unreachable_code))]
        {
            // No risk of overflow here, since there won't be that amount of shares
            // in circulation.
            let share_amt = self.internal_adjust(
                outcome,
                I256::from_le_bytes(fusdc_amt.to_le_bytes::<32>())
                    .checked_neg()
                    .ok_or(Error::CheckedNegOverflow)?,
                _recipient,
            )?;
            // Did something bizarre happen here? Time to check.
            assert_or!(share_amt < MAX_UINT256, Error::U256TooLarge);
            assert_or!(!share_amt.is_zero(), Error::ZeroShares);
            if deadline.is_zero() {
                c!(share_call::take_from_sender(share_addr, share_amt));
            } else {
                c!(share_call::take_from_sender_permit(
                    share_addr, share_amt, deadline, v, r, s
                ));
            }
            Ok(share_amt)
        }
    }

    pub fn add_liquidity_permit(
        &mut self,
        fusdc: U256,
        recipient: Address,
        deadline: U256,
        v: u8,
        r: FixedBytes<32>,
        s: FixedBytes<32>,
    ) -> R<Vec<(FixedBytes<8>, U256)>> {
        assert_or!(!fusdc.is_zero(), Error::ZeroAmount);
        if deadline.is_zero() {
            c!(fusdc_call::take_from_sender(fusdc));
        } else {
            c!(fusdc_call::take_from_sender_permit(
                fusdc, deadline, v, r, s
            ))
        }
        // Add liquidity to every outcome, AMM only.
        #[cfg(feature = "trading-backend-dpm")]
        return Err(Error::AMMOnly);
        #[cfg(not(feature = "trading-backend-dpm"))]
        {
            let shares = self.internal_add_liquidity_permit(fusdc)?;
            for (outcome_id, value) in shares.iter() {
                // Send the user their shares from each outcome they LP'd.
                c!(share_call::mint(
                    recipient,
                    proxy::get_share_addr(
                        self.factory_addr.get(),
                        contract_address(), // Address of this contract, the Trading contract.
                        self.share_impl.get(),
                        *outcome_id,
                    ),
                    *value
                ));
            }
            Ok(shares)
        }
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
        let fusdc = self.internal_payoff(outcome_id, share_bal)?;
        evm::log(events::PayoffActivated {
            identifier: outcome_id,
            sharesSpent: share_bal,
            spender: msg_sender(),
            recipient,
            fusdcReceived: fusdc,
        });
        fusdc_call::transfer(recipient, fusdc)?;
        Ok(fusdc)
    }

    #[allow(non_snake_case)]
    pub fn payoff_quote_1_F_A_6_D_C_28(&self, outcome_id: FixedBytes<8>, amt: U256) -> R<U256> {
        self.internal_payoff(outcome_id, amt)
    }
}

impl StorageTrading {
    // Shares returned by the DPM. Does not set any state.
    #[allow(unused)]
    fn internal_dpm_mint(&self, outcome_id: FixedBytes<8>, value: U256) -> R<U256> {
        let n_1 = self.outcome_shares.get(outcome_id);
        let outcome_invested = self.outcome_invested.get(outcome_id);
        let m = c!(fusdc_u256_to_decimal(value));
        // Prevent them from taking less than the minimum amount to LP with.
        assert_or!(m > Decimal::from(MINIMUM_MINT_AMT), Error::TooSmallNumber);
        let m_1 = c!(fusdc_u256_to_decimal(outcome_invested));
        let n_2 = self.global_shares.get() - n_1;
        let n_1 = c!(share_u256_to_decimal(n_1));
        let m_2 = c!(fusdc_u256_to_decimal(
            self.global_invested.get() - outcome_invested
        ));
        let n_2 = c!(share_u256_to_decimal(n_2));
        share_decimal_to_u256(c!(maths::dpm_shares(m_1, m_2, n_1, n_2, m)))
    }

    /// Calculate the AMM amount of shares you would receive. Sets the
    /// shares for each outcome in the outcomes list during its operation.
    #[allow(unused)]
    fn internal_amm_mint(&mut self, outcome_id: FixedBytes<8>, value: I256) -> R<U256> {
        let mut product = U256::from(1);
        let outcome_list_len = self.outcome_list.len();
        /*
        for i in range(len(self.shares)):
            self.shares[i] += amount
            product = c!(product.checked_mul(self.shares[i]).ok_or(Error::CheckedMulOverflow));
            self.total_shares[i] += amount
        */
        for i in 0..outcome_list_len {
            let o = self.outcome_list.get(i).unwrap();
            let outcome_shares = self.outcome_shares.get(o);
            let value_raw = value.unsigned_abs();
            // It's okay for us to use wrapping math, since this should become
            // positive in the end.
            self.outcome_shares.setter(o).set(if value.is_negative() {
                outcome_shares.wrapping_sub(value_raw)
            } else {
                c!(outcome_shares
                    .checked_add(value_raw)
                    .ok_or(Error::CheckedAddOverflow))
            });
            let outcome_total_shares = self.outcome_total_shares.get(o);
            self.outcome_total_shares
                .setter(o)
                .set(if value.is_negative() {
                    outcome_total_shares.wrapping_sub(value_raw)
                } else {
                    c!(outcome_total_shares
                        .checked_add(value_raw)
                        .ok_or(Error::CheckedAddOverflow))
                });
            product = c!(product
                .checked_mul(self.outcome_shares.get(o))
                .ok_or(Error::CheckedMulOverflow));
        }
        let shares_before = self.outcome_shares.get(outcome_id);
        product = c!(product
            .checked_div(self.outcome_shares.get(outcome_id))
            .ok_or(Error::CheckedDivOverflow));
        //self.shares[outcome] = (self.liquidity ** self.outcomes) / product
        let shares = self
            .amm_liquidity
            .get()
            .checked_pow(U256::from(self.outcome_list.len()))
            .ok_or(Error::CheckedPowOverflow)?
            .checked_div(product)
            .ok_or(Error::CheckedDivOverflow)?;
        self.outcome_shares.setter(outcome_id).set(shares);
        //self.user_shares = self.shares_before - self.shares[outcome]
        Ok(shares_before.wrapping_sub(shares))
    }

    fn internal_adjust(
        &mut self,
        outcome_id: FixedBytes<8>,
        value: I256,
        recipient: Address,
    ) -> R<U256> {
        // Ensure that we're not complete, and that the time hasn't expired.
        assert_or!(
            self.when_decided.get().is_zero()
                && !self.is_shutdown.get()
                && self.time_ending.get() > U64::from(block_timestamp()),
            Error::DoneVoting
        );
        //assert_or!(!value.is_zero(), Error::ZeroAmount);
        #[cfg(feature = "trading-backend-dpm")]
        assert_or!(value.is_positive(), Error::NegativeAmountWhenDPM);
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
        let value_raw = value.unsigned_abs();
        // We only send the creator some money when mints take place.
        let value = if value.is_positive() {
            // Here we do some fee adjustment to send the fee recipient their money.
            let fee_for_creator = (value_raw * self.fee_creator.get()) / FEE_SCALING;
            c!(fusdc_call::transfer(
                self.fee_recipient.get(),
                fee_for_creator
            ));
            // Take some fees, and add them to the pot for moderation reasons.
            // TODO
            // Collect some fees for the team (for moderation reasons).
            let fee_for_team = (value_raw * FEE_SPN_MINT_PCT) / FEE_SCALING;
            c!(fusdc_call::transfer(DAO_ADDR, fee_for_team));
            let new_val = value_raw - fee_for_creator - fee_for_team;
            I256::from_le_bytes(new_val.to_le_bytes::<32>())
        } else {
            value
        };
        // Set the global amounts that were invested.
        let outcome_invested_before = self.outcome_invested.get(outcome_id);
        // We need to increase by the amount we allocate, the AMM should do that
        // internally. Some extra fields are needed for the DPM's calculations.
        // We can assume that the DPM is in use if the amount is negative. We don't
        // allow negative numbers with any code that touches the DPM.
        #[cfg(feature = "trading-backend-dpm")]
        let shares = {
            let shares_before = self.outcome_shares.get(outcome_id);
            let shares = c!(self.internal_dpm_mint(outcome_id, value_raw));
            self.outcome_shares.setter(outcome_id).set(c!(shares_before
                .checked_add(shares)
                .ok_or(Error::CheckedAddOverflow)));
            self.global_shares.set(c!(self
                .global_shares
                .get()
                .checked_add(shares)
                .ok_or(Error::CheckedAddOverflow)));
            shares
        };
        // This function is needing to be used this way, since it is side effect heavy.
        // Internally it will set variables including the global shares count.
        // We take the difference between the shares that already existed, and ours
        // now, to get the correct number.
        #[cfg(not(feature = "trading-backend-dpm"))]
        let shares = c!(self.internal_amm_mint(outcome_id, value));
        // If the amount is positive, then this is a mint event. We're going to
        // return them the shares.
        if value.is_positive() {
            // Get the address of the share, then mint some in line with the
            // shares we made to the user's address!
            let share_addr = proxy::get_share_addr(
                self.factory_addr.get(),
                contract_address(),
                self.share_impl.get(),
                outcome_id,
            );
            self.outcome_invested
                .setter(outcome_id)
                .set(c!(outcome_invested_before
                    .checked_add(value_raw)
                    .ok_or(Error::CheckedAddOverflow)));
            self.global_invested.set(c!(self
                .global_invested
                .get()
                .checked_add(value_raw)
                .ok_or(Error::CheckedAddOverflow)));

            assert_or!(shares > U256::ZERO, Error::UnusualAmountCreated);
            c!(share_call::mint(share_addr, recipient, shares));

            evm::log(events::SharesMinted {
                identifier: outcome_id,
                shareAmount: shares,
                spender: msg_sender(),
                recipient,
                fusdcSpent: value_raw,
            });

            Ok(shares)
        } else {
            self.outcome_invested
                .setter(outcome_id)
                .set(c!(outcome_invested_before
                    .checked_sub(value_raw)
                    .ok_or(Error::CheckedSubOverflow)));
            self.global_invested.set(c!(self
                .global_invested
                .get()
                .checked_sub(value_raw)
                .ok_or(Error::CheckedSubOverflow)));

            /* evm::log(events::SharesBurned {
                identifier: outcome_id,
                shareAmount: shares,
                spender: msg_sender(),
                recipient,
                fusdcSpent: value_raw,
            }); */

            fusdc_call::transfer(recipient, value_raw)?;

            Ok(value_raw)
        }
    }

    fn internal_payoff(&self, outcome_id: FixedBytes<8>, share_bal: U256) -> R<U256> {
        #[cfg(feature = "trading-backend-dpm")]
        {
            fusdc_decimal_to_u256(maths::dpm_payoff(
                share_u256_to_decimal(share_bal)?,
                share_u256_to_decimal(self.outcome_shares.get(outcome_id))?,
                fusdc_u256_to_decimal(self.global_invested.get())?,
            )?)
        }
        // This should be $1!
        #[cfg(not(feature = "trading-backend-dpm"))]
        {
            let fusdc = self.global_invested.get() / self.outcome_total_shares.get(outcome_id);
            Ok(fusdc * share_bal)
        }
    }

    pub fn internal_add_liquidity_permit(&mut self, value: U256) -> R<Vec<(FixedBytes<8>, U256)>> {
        let mut greatest_shares_id = self.outcome_list.get(0).unwrap();
        let mut greatest_shares_amt = U256::ZERO;
        let mut lowest_shares_id = self.outcome_list.get(0).unwrap();
        let mut lowest_shares_amt = U256::MAX;
        for o in (0..self.outcome_list.len()).map(|x| self.outcome_list.get(x).unwrap()) {
            let shares = self
                .outcome_shares
                .get(o)
                .checked_add(value)
                .ok_or(Error::CheckedAddOverflow)?;
            self.outcome_shares.setter(o).set(shares);
            if shares > greatest_shares_amt {
                greatest_shares_id = o;
                greatest_shares_amt = shares;
            }
            if shares < lowest_shares_amt {
                lowest_shares_id = o;
                lowest_shares_amt = shares;
            }
        }
        let least_likely_price = self.internal_amm_price(greatest_shares_id)?;
        let most_likely_price = self.internal_amm_price(lowest_shares_id)?;
        for o in (0..self.outcome_list.len()).map(|x| self.outcome_list.get(x).unwrap()) {
            let x = self.outcome_shares.get(o);
            self.outcome_shares
                .setter(o)
                .set(c!(x.checked_add(x).ok_or(Error::CheckedAddOverflow)));
            let x = self.outcome_total_shares.get(o);
            self.outcome_total_shares
                .setter(o)
                .set(c!(x.checked_add(x).ok_or(Error::CheckedAddOverflow)));
        }
        //self.shares[most_likely] = self.shares[least_likely]*self.outcome_prices[least_likely]/self.outcome_prices[most_likely]
        {
            let x = self
                .outcome_shares
                .get(greatest_shares_id)
                .checked_mul(
                    least_likely_price
                        .checked_div(most_likely_price)
                        .ok_or(Error::CheckedDivOverflow)?,
                )
                .ok_or(Error::CheckedMulOverflow)?;
            self.outcome_shares.setter(lowest_shares_id).set(x);
        }
        let product = (0..self.outcome_list.len())
            .map(|x| self.outcome_shares.get(self.outcome_list.get(x).unwrap()))
            .try_fold(U256::ZERO, |acc, x| {
                acc.checked_mul(x).ok_or(Error::CheckedMulOverflow)
            })?;
        self.amm_liquidity
            .set(maths::rooti(product, self.outcome_list.len() as u32));
        // Start to send out the shares that we minted, as well as return the identifiers of what we sent.
        (0..self.outcome_list.len())
            .map(|o| {
                let outcome_id = self.outcome_list.get(o).unwrap();
                Ok((outcome_id, value))
            })
            .collect::<Result<Vec<_>, _>>()
    }

    pub fn internal_remove_liquidity(
        &mut self,
        value: U256,
        recipient: Address,
    ) -> R<Vec<(FixedBytes<8>, U256)>> {
        // The most likely is the outcome with the least amount of shares.
        let mut most_likely_shares_id = self.outcome_list.get(0).unwrap();
        let mut most_likely_shares_amt = U256::ZERO;
        // The least likely is the outcome with the most amount of shares.
        let mut least_likely_shares_id = self.outcome_list.get(0).unwrap();
        let mut least_likely_shares_amt = U256::MAX;
        for o in (0..self.outcome_list.len()).map(|x| self.outcome_list.get(x).unwrap()) {
            let shares = self.outcome_shares.get(o);
            if shares > least_likely_shares_amt {
                least_likely_shares_id = o;
                most_likely_shares_amt = shares;
            }
            if shares < most_likely_shares_amt {
                most_likely_shares_id = o;
                most_likely_shares_amt = shares;
            }
        }
        let liquidity_shares_val = (self.amm_liquidity.get() / least_likely_shares_amt) * value;
        let most_likely_price = c!(self.internal_amm_price(most_likely_shares_id));
        for o in (0..self.outcome_list.len()).map(|x| self.outcome_list.get(x).unwrap()) {
            if o != most_likely_shares_id {
                let price = c!(self.internal_amm_price(o));
                self.outcome_shares
                    .setter(o)
                    .set((most_likely_shares_amt * most_likely_price) / price);
            }
        }
        let product = (0..self.outcome_list.len()).fold(U256::from(1), |product, x| {
            product * self.outcome_shares.get(self.outcome_list.get(x).unwrap())
        });
        self.amm_liquidity
            .set(maths::rooti(product, self.outcome_list.len() as u32));
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
