// Trading contains the actual behaviour of the DPM, including the
// functions to mint, and the ability for the oracle to disable the
// trading.

use std::collections::HashMap;

use stylus_sdk::{
    alloy_primitives::{aliases::*, *},
    contract, evm, msg,
};

use crate::{
    decimal::{
        fusdc_decimal_to_u256, fusdc_u256_to_decimal, round_down, share_decimal_to_u256,
        share_u256_to_decimal,
    },
    error::*,
    events,
    fees::*,
    fusdc_call,
    immutables::*,
    maths, proxy, share_call,
};

use rust_decimal::Decimal;

// This exports user_entrypoint, which we need to have the entrypoint code.
pub use crate::storage_trading::*;

#[cfg_attr(feature = "contract-trading-mint", stylus_sdk::prelude::public)]
impl StorageTrading {
    // Shares returned by the DPM. Does not set any state.
    fn internal_dpm_mint(&self, outcome_id: FixedBytes<8>, value: U256) -> R<U256> {
        let n_1 = self.outcome_shares.get(outcome_id);
        let outcome_invested = self.outcome_invested.get(outcome_id);
        let m = round_down(fusdc_u256_to_decimal(value)?);
        // Prevent them from taking less than the minimum amount to LP with.
        assert_or!(m >= Decimal::from(MINIMUM_MINT_AMT), Error::TooSmallNumber);
        let m_1 = fusdc_u256_to_decimal(outcome_invested)?;
        let n_2 = self.global_shares.get() - n_1;
        let n_1 = share_u256_to_decimal(n_1)?;
        let m_2 = fusdc_u256_to_decimal(self.global_invested.get() - outcome_invested)?;
        let n_2 = share_u256_to_decimal(n_2)?;
        share_decimal_to_u256(maths::dpm_shares(m_1, m_2, n_1, n_2, m)?)
    }

    /// Calculate the AMM amount of shares you would receive. Sets the
    /// shares for each outcome in the outcomes list during its operation.
    fn internal_amm_mint(&mut self, outcome_id: FixedBytes<8>, value: U256) -> R<U256> {
        let mut product = U256::from(1);
        let outcome_list_len = self.outcome_list.len();
        /*
        for i in range(len(self.shares)):
            self.shares[i] += amount
            product *= self.shares[i]
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
        product = product
            .checked_div(self.outcome_shares.get(outcome_id))
            .ok_or(Error::CheckedDivOverflow)?;
        //self.shares[outcome] = (self.liquidity ** self.outcomes) / product
        self.seed_invested
            .get()
            .checked_pow(U256::from(self.outcome_list.len()))
            .ok_or(Error::CheckedPowOverflow)?
            .checked_div(product)
            .ok_or(Error::CheckedDivOverflow)
            .into()
    }

    fn internal_mint(
        &mut self,
        outcome_id: FixedBytes<8>,
        value: U256,
        recipient: Address,
    ) -> R<U256> {
        assert_or!(self.when_decided.get().is_zero(), Error::DoneVoting);
        assert_or!(value > U256::ZERO, Error::ZeroAmount);

        let recipient = if recipient.is_zero() {
            msg::sender()
        } else {
            recipient
        };

        // Make sure that the outcome exists.
        assert_or!(
            self.outcome_shares.get(outcome_id) > U256::ZERO,
            Error::NonexistentOutcome
        );

        // Here we do some fee adjustment to send the fee recipient their money.
        let fee_for_creator = (value * FEE_MINT_PCT) / FEE_SCALING;
        fusdc_call::transfer(self.fee_recipient.get(), fee_for_creator)?;
        let value = value - fee_for_creator;

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

        let shares_before = self.outcome_shares.get(outcome_id);
        let shares = if self.internal_is_dpm() {
            // We need to increase by the amount we allocate, the AMM should do that
            // internally. Some extra fields are needed for the DPM's calculations.
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
        } else {
            // This function is needing to be used this way, since it is side effect heavy.
            // Internally it will set variables including the global shares count.
            // We take the difference between the shares that already existed, and ours
            // now, to get the correct number.
            self.internal_amm_mint(outcome_id, value)?
                .checked_sub(shares_before)
                .ok_or(Error::CheckedSubOverflow)?
        };
        // Get the address of the share, then mint some in line with the
        // shares we made to the user's address!
        let share_addr = proxy::get_share_addr(
            FACTORY_ADDR,
            contract::address(),
            self.share_impl.get(),
            outcome_id,
        );
        assert_or!(shares > U256::ZERO, Error::UnusualAmountCreated);
        share_call::mint(share_addr, recipient, shares)?;

        evm::log(events::SharesMinted {
            identifier: outcome_id,
            shareAmount: shares,
            spender: msg::sender(),
            recipient,
            fusdcSpent: value,
        });

        ok(shares)
    }

    pub fn test_dpm_mint(
        &mut self,
        outcome_id: FixedBytes<8>,
        value: U256,
    ) -> Result<U256, Vec<u8>> {
        #[cfg(feature = "testing")]
        return Ok(self.internal_dpm_mint(outcome_id, value).unwrap());
        #[cfg(not(feature = "testing"))]
        Err(vec![])
    }

    pub fn test_amm_mint(
        &mut self,
        outcome_id: FixedBytes<8>,
        value: U256,
    ) -> Result<U256, Vec<u8>> {
        #[cfg(feature = "testing")]
        return Ok(self.internal_amm_mint(outcome_id, value).unwrap());
        #[cfg(not(feature = "testing"))]
        Err(vec![])
    }

    #[allow(non_snake_case)]
    pub fn mint_227_C_F_432(
        &mut self,
        outcome: FixedBytes<8>,
        value: U256,
        recipient: Address,
    ) -> R<U256> {
        fusdc_call::take_from_sender(value)?;
        self.internal_mint(outcome, value, recipient)
    }

    fn internal_dpm_quote(&self, outcome_id: FixedBytes<8>, value: U256) -> R<U256> {
        let m_1 = fusdc_u256_to_decimal(self.outcome_invested.get(outcome_id))?;
        let n_1 = self.outcome_shares.get(outcome_id);
        let n_2 = self.global_shares.get() - n_1;
        let n_1 = share_u256_to_decimal(n_1)?;
        let n_2 = share_u256_to_decimal(n_2)?;
        let m_2 = fusdc_u256_to_decimal(
            self.global_invested.get() - self.outcome_invested.get(outcome_id),
        )?;
        share_decimal_to_u256(maths::dpm_shares(
            m_1,
            m_2,
            n_1,
            n_2,
            fusdc_u256_to_decimal(value)?,
        )?)
    }

    fn internal_amm_quote(&self, outcome_id: FixedBytes<8>, value: U256) -> R<U256> {
        let mut product = U256::from(1);
        let outcome_list_len = self.outcome_list.len();
        let mut our_shares = U256::ZERO;
        for i in 0..outcome_list_len {
            let o = self.outcome_list.get(i).unwrap();
            let outcome_shares = self.outcome_shares.get(o);
            let shares = outcome_shares
                .checked_add(value)
                .ok_or(Error::CheckedAddOverflow)?;
            if o == outcome_id {
                our_shares = shares;
            }
            product = product
                .checked_mul(shares)
                .ok_or(Error::CheckedMulOverflow)?;
        }
        product = product
            .checked_div(our_shares)
            .ok_or(Error::CheckedDivOverflow)?;
        //self.shares[outcome] = (self.liquidity ** self.outcomes) / product
        let shares = self
            .seed_invested
            .get()
            .checked_pow(U256::from(self.outcome_list.len()))
            .ok_or(Error::CheckedPowOverflow)?
            .checked_div(product)
            .ok_or(Error::CheckedDivOverflow)?;
        ok(shares)
    }

    #[allow(non_snake_case)]
    pub fn quote_8168_F_301(&self, outcome_id: FixedBytes<8>, value: U256) -> R<U256> {
        if !self.when_decided.is_zero() {
            return ok(U256::ZERO);
        }
        assert_or!(
            self.outcome_shares.get(outcome_id) > U256::ZERO,
            Error::NonexistentOutcome
        );
        if self.internal_is_dpm() {
            self.internal_dpm_quote(outcome_id, value)
        } else {
            self.internal_amm_quote(outcome_id, value)
        }
    }

    #[allow(clippy::too_many_arguments)]
    #[allow(non_snake_case)]
    pub fn mint_permit_B8_D_681_A_D(
        &mut self,
        outcome: FixedBytes<8>,
        value: U256,
        recipient: Address,
        deadline: U256,
        v: u8,
        r: FixedBytes<32>,
        s: FixedBytes<32>,
    ) -> R<U256> {
        fusdc_call::take_from_sender_permit(value, deadline, v, r, s)?;
        self.internal_mint(outcome, value, recipient)
    }

    fn internal_dpm_price(&self, id: FixedBytes<8>) -> R<U256> {
        let m_1 = fusdc_u256_to_decimal(self.outcome_invested.get(id))?;
        let n_1 = self.outcome_shares.get(id);
        let n_2 = share_u256_to_decimal(
            self.global_shares
                .get()
                .checked_sub(n_1)
                .ok_or(Error::CheckedSubOverflow)?,
        )?;
        let n_1 = share_u256_to_decimal(n_1)?;
        let m_2 = fusdc_u256_to_decimal(
            self.global_invested
                .get()
                .checked_sub(self.outcome_invested.get(id))
                .ok_or(Error::CheckedSubOverflow)?,
        )?;
        fusdc_decimal_to_u256(maths::dpm_price(m_1, m_2, n_1, n_2, Decimal::ZERO)?)
    }

    fn internal_amm_price(&self, id: FixedBytes<8>) -> R<U256> {
        let outcome_list_len = self.outcome_list.len();
        let mut price_weights = HashMap::new();
        //for i in range(len(self.shares)):
        for i in 0..outcome_list_len {
            //product = 1
            let mut product = U256::from(1);
            //for j in range(len(self.shares)):
            for j in 0..outcome_list_len {
                let o = self.outcome_list.get(j).unwrap();
                //if i != j:
                if i != j {
                    //product *= self.shares[j]
                    product = product
                        .checked_mul(self.outcome_shares.get(o))
                        .ok_or(Error::CheckedMulOverflow)?;
                }
            }
            //outcome_price_weights.append(product)
            price_weights.insert(self.outcome_list.get(i).unwrap(), product);
        }
        //outcome_price_weights[k] / price_weight_of_all_outcomes
        ok(price_weights.get(&id).unwrap() / price_weights.values().sum::<U256>())
    }

    #[allow(clippy::too_many_arguments)]
    #[allow(non_snake_case)]
    pub fn price_F_3_C_364_B_C(&self, id: FixedBytes<8>) -> R<U256> {
        if !self.when_decided.is_zero() {
            return ok(U256::ZERO);
        }
        if self.internal_is_dpm() {
            self.internal_dpm_price(id)
        } else {
            self.internal_amm_price(id)
        }
    }
}
