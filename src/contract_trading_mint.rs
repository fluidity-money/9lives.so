// Trading contains the actual behaviour of the DPM, including the
// functions to mint, and the ability for the oracle to disable the
// trading.

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
    events, fusdc_call,
    immutables::*,
    maths, proxy, share_call,
};

use rust_decimal::Decimal;

// This exports user_entrypoint, which we need to have the entrypoint code.
pub use crate::storage_trading::*;

#[cfg_attr(feature = "contract-trading-mint", stylus_sdk::prelude::public)]
impl StorageTrading {
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

        let outcome_invested = self.outcome_invested.get(outcome_id);

        // Here we do some fee adjustment to send the fee recipient their money.
        let fee_for_creator = (value * MINT_FEE_PCT) / FEE_SCALING;
        fusdc_call::transfer(self.fee_recipient.get(), fee_for_creator)?;
        let value = value - fee_for_creator;

        // Set the global states.
        self.outcome_invested
            .setter(outcome_id)
            .set(outcome_invested + value);

        self.global_invested.set(
            self.global_invested
                .get()
                .checked_add(value)
                .ok_or(Error::CheckedAddOverflow)?,
        );

        let n_1 = self.outcome_shares.get(outcome_id);

        // Use the DPM if we have two outcomes.
        let shares = if self.is_dpm.get() {
            let m = round_down(fusdc_u256_to_decimal(value)?);
            // Prevent them from taking less than the minimum amount to LP with.
            assert_or!(m >= Decimal::from(MINIMUM_MINT_AMT), Error::TooSmallNumber);
            let m_1 = fusdc_u256_to_decimal(outcome_invested)?;
            let n_2 = self
                .global_shares
                .get()
                .checked_sub(n_1)
                .ok_or(Error::CheckedSubOverflow)?;
            let n_1 = share_u256_to_decimal(n_1)?;
            let m_2 = fusdc_u256_to_decimal(
                self.global_invested
                    .get()
                    .checked_sub(outcome_invested)
                    .ok_or(Error::CheckedSubOverflow)?,
            )?;
            let n_2 = share_u256_to_decimal(n_2)?;
            dbg!(
                m_1,
                m_2,
                n_1,
                n_2,
                m,
                maths::dpm_shares(m_1, m_2, n_1, n_2, m)?,
                share_decimal_to_u256(maths::dpm_shares(m_1, m_2, n_1, n_2, m)?)?
            );
            share_decimal_to_u256(maths::dpm_shares(m_1, m_2, n_1, n_2, m)?)?
        } else {
            let mut product = U256::from(1);
            let outcome_list_len = self.outcome_list.len();
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
            let shares = self
                .seed_invested
                .get()
                .checked_pow(U256::from(self.outcome_list.len()))
                .ok_or(Error::CheckedPowOverflow)?
                .checked_div(product)
                .ok_or(Error::CheckedDivOverflow)?;
            self.outcome_shares.setter(outcome_id).set(shares);
            shares
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

        // Set the global states as the output of shares.
        self.outcome_shares.setter(outcome_id).set(n_1 + shares);
        self.global_shares.set(self.global_shares.get() + shares);

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

    #[allow(non_snake_case)]
    pub fn quote_101_C_B_E_35(
        &mut self,
        outcome_id: FixedBytes<8>,
        value: U256,
        _recipient: Address,
    ) -> R<U256> {
        if !self.when_decided.is_zero() {
            return ok(U256::ZERO);
        }
        let m_1 = fusdc_u256_to_decimal(self.outcome_invested.get(outcome_id))?;
        let n_1 = self.global_shares.get();
        let n_2 = self
            .global_shares
            .get()
            .checked_sub(n_1)
            .ok_or(Error::CheckedSubOverflow)?;
        let n_1 = share_u256_to_decimal(n_1)?;
        let n_2 = share_u256_to_decimal(n_2)?;
        let m_2 = fusdc_u256_to_decimal(
            self.global_invested
                .get()
                .checked_sub(self.global_invested.get())
                .ok_or(Error::CheckedSubOverflow)?,
        )?;
        share_decimal_to_u256(maths::dpm_shares(
            m_1,
            m_2,
            n_1,
            n_2,
            fusdc_u256_to_decimal(value)?,
        )?)
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

    #[allow(clippy::too_many_arguments)]
    #[allow(non_snake_case)]
    pub fn price_F_3_C_364_B_C(&self, id: FixedBytes<8>) -> R<U256> {
        if !self.when_decided.is_zero() {
            return ok(U256::ZERO);
        }
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
}
