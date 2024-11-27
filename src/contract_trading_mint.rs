// Trading contains the actual behaviour of the DPM, including the
// functions to mint, and the ability for the oracle to disable the
// trading.

use stylus_sdk::{
    alloy_primitives::{aliases::*, *},
    contract, evm, msg,
};

use crate::{
    decimal::{fusdc_decimal_to_u256, fusdc_u256_to_decimal, round_down, share_decimal_to_u256},
    error::*,
    events, fusdc_call,
    immutables::*,
    maths, proxy, share_call,
    storage_trading_dpm::StorageTradingDPM,
};

use rust_decimal::Decimal;

#[cfg(feature = "contract-trading-trading-mint")]
pub use crate::storage_trading_dpm::user_entrypoint;

#[cfg_attr(
    feature = "contract-trading-trading-mint",
    stylus_sdk::prelude::public
)]
impl StorageTradingDPM {
    fn internal_mint(
        &mut self,
        outcome_id: FixedBytes<8>,
        value: U256,
        recipient: Address,
    ) -> Result<U256, Error> {
        assert_or!(self.when_decided.get().is_zero(), Error::DoneVoting);
        assert_or!(value > U256::ZERO, Error::ZeroAmount);

        // Assume we already took the user's balance. Get the state of
        // everything else as u256s.
        let outcome_invested = self.outcome_invested.get(outcome_id);
        let m_1 = fusdc_u256_to_decimal(outcome_invested)?;
        let n_1 = self.outcome_shares.get(outcome_id);
        let n_2 = self
            .global_shares
            .get()
            .checked_sub(n_1)
            .ok_or(Error::CheckedSubOverflow)?;
        let m_2 = fusdc_u256_to_decimal(
            self.global_invested
                .get()
                .checked_sub(outcome_invested)
                .ok_or(Error::CheckedSubOverflow)?,
        )?;

        // Here we do some fee adjustment to send the fee recipient their money.
        let fee_for_creator = ((FEE_SCALING * value) * MINT_FEE_PCT) / FEE_SCALING;
        fusdc_call::transfer(self.fee_recipient.get(), fee_for_creator)?;
        let value = value - fee_for_creator;

        let m = round_down(fusdc_u256_to_decimal(value)?);

        // Prevent them from taking less than the minimum amount to LP with.
        assert_or!(m >= Decimal::from(MINIMUM_MINT_AMT), Error::TooSmallNumber);

        let outcome_invested = self.outcome_invested.get(outcome_id);

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

        // Convert everything to decimals for this function.
        let shares = maths::shares(m_1, m_2, n_1, n_2, m)?;

        // Set the global states as the output of shares.
        self.outcome_shares.setter(outcome_id).set(n_1 + shares);
        self.global_shares.set(self.global_shares.get() + shares);

        // Get the address of the share, then mint some in line with the
        // shares we made to the user's address!

        let share_addr = proxy::get_share_addr(
            FACTORY_ADDR,
            contract::address(),
            self.share_impl.get(),
            outcome_id,
        );

        let shares = share_decimal_to_u256(shares)?;

        // This can happen where someone supplies too much at first. FIXME

        assert_or!(shares > U256::ZERO, Error::UnusualAmountCreated);

        share_call::mint(share_addr, recipient, shares)?;

        evm::log(events::SharesMinted {
            identifier: outcome_id,
            shareAmount: shares,
            spender: msg::sender(),
            recipient,
            fusdcSpent: value,
        });

        Ok(shares)
    }

    #[allow(non_snake_case)]
    pub fn mint_227_C_F_432(
        &mut self,
        outcome: FixedBytes<8>,
        value: U256,
        recipient: Address,
    ) -> Result<U256, Error> {
        fusdc_call::take_from_sender(value)?;
        self.internal_mint(outcome, value, recipient)
    }

    #[allow(non_snake_case)]
    pub fn quote_101_C_B_E_35(
        &mut self,
        outcome_id: FixedBytes<8>,
        value: U256,
        _recipient: Address,
    ) -> Result<U256, Error> {
        if !self.when_decided.is_zero() {
            return Ok(U256::ZERO);
        }
        let m_1 = fusdc_u256_to_decimal(self.outcome_invested.get(outcome_id))?;
        let n_1 = self.global_shares.get();
        let n_2 = self
            .global_shares
            .get()
            .checked_sub(n_1)
            .ok_or(Error::CheckedSubOverflow)?;
        let m_2 = fusdc_u256_to_decimal(
            self.global_invested
                .get()
                .checked_sub(self.global_invested.get())
                .ok_or(Error::CheckedSubOverflow)?,
        )?;
        share_decimal_to_u256(maths::shares(
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
    ) -> Result<U256, Error> {
        fusdc_call::take_from_sender_permit(value, deadline, v, r, s)?;
        self.internal_mint(outcome, value, recipient)
    }

    #[allow(clippy::too_many_arguments)]
    #[allow(non_snake_case)]
    pub fn price_F_3_C_364_B_C(&self, id: FixedBytes<8>) -> Result<U256, Error> {
        if !self.when_decided.is_zero() {
            return Ok(U256::ZERO);
        }
        let m_1 = fusdc_u256_to_decimal(self.outcome_invested.get(id))?;
        let n_1 = self.outcome_shares.get(id);
        let n_2 = self
            .global_shares
            .get()
            .checked_sub(n_1)
            .ok_or(Error::CheckedSubOverflow)?;
        let m_2 = fusdc_u256_to_decimal(
            self.global_invested
                .get()
                .checked_sub(self.outcome_invested.get(id))
                .ok_or(Error::CheckedSubOverflow)?,
        )?;
        fusdc_decimal_to_u256(maths::price(m_1, m_2, n_1, n_2, Decimal::ZERO)?)
    }
}
