use crate::{
    decimal::{
        fusdc_decimal_to_u256, fusdc_u256_to_decimal, share_decimal_to_u256, share_u256_to_decimal,
    },
    error::*,
    events, fusdc_call,
    immutables::*,
    maths, proxy, share_call,
    storage_trading::*,
    utils::{contract_address, msg_sender},
};

use stylus_sdk::{
    alloy_primitives::{aliases::*, *},
    evm,
};

use alloc::vec::Vec;

use rust_decimal::Decimal;

impl StorageTrading {
    pub fn internal_dpm_ctor(&mut self, outcomes: Vec<FixedBytes<8>>) -> R<()> {
        // We assume that the caller already supplied the liquidity to
        // us, and we set them as the factory.
        let seed_liquidity = U256::from(outcomes.len()) * FUSDC_DECIMALS_EXP;
        self.dpm_global_invested.set(seed_liquidity);
        let outcomes_len: i64 = outcomes.len().try_into().unwrap();
        self.dpm_global_shares
            .set(U256::from(outcomes_len) * SHARE_DECIMALS_EXP);
        // Start to go through each outcome, and seed it with its initial amount.
        // And set each slot in the storage with the outcome id for Longtail
        // later.
        for outcome_id in outcomes {
            // This isn't a precaution that we actually need, but there may be weird
            // behaviour with this being possible (ie, payoff before the end date).
            assert_or!(!outcome_id.is_zero(), Error::OutcomeIsZero);
            // We always set this to 1 now.
            self.dpm_outcome_invested
                .setter(outcome_id)
                .set(SHARE_DECIMALS_EXP);
            self.dpm_outcome_shares
                .setter(outcome_id)
                .set(U256::from(1) * SHARE_DECIMALS_EXP);
            self.outcome_list.push(outcome_id);
        }
        Ok(())
    }

    #[allow(clippy::too_many_arguments)]
    #[allow(non_snake_case)]
    pub fn internal_dpm_mint(
        &mut self,
        outcome_id: FixedBytes<8>,
        value: U256,
        recipient: Address,
    ) -> R<U256> {
        // Make sure that the outcome exists by checking if we set this up with some shares.
        assert_or!(
            self.dpm_outcome_shares.get(outcome_id) > U256::ZERO,
            Error::NonexistentOutcome
        );
        // Set the global amounts that were invested.
        let dpm_outcome_invested_before = self.dpm_outcome_invested.get(outcome_id);
        // We need to increase by the amount we allocate, the AMM should do that
        // internally. Some extra fields are needed for the DPM's calculations.
        // We can assume that the DPM is in use if the amount is negative. We don't
        // allow negative numbers with any code that touches the DPM.
        let shares = {
            let shares_before = self.dpm_outcome_shares.get(outcome_id);
            let shares = c!(self.internal_calc_dpm_mint(outcome_id, value));
            self.dpm_outcome_shares
                .setter(outcome_id)
                .set(c!(shares_before
                    .checked_add(shares)
                    .ok_or(Error::CheckedAddOverflow)));
            self.dpm_global_shares.set(c!(self
                .dpm_global_shares
                .get()
                .checked_add(shares)
                .ok_or(Error::CheckedAddOverflow)));
            shares
        };
        // Get the address of the share, then mint some in line with the
        // shares we made to the user's address!
        let share_addr = proxy::get_share_addr(
            self.factory_addr.get(),
            contract_address(),
            self.share_impl.get(),
            outcome_id,
        );
        self.dpm_outcome_invested
            .setter(outcome_id)
            .set(c!(dpm_outcome_invested_before
                .checked_add(value)
                .ok_or(Error::CheckedAddOverflow)));
        self.dpm_global_invested.set(c!(self
            .dpm_global_invested
            .get()
            .checked_add(value)
            .ok_or(Error::CheckedAddOverflow)));

        assert_or!(shares > U256::ZERO, Error::UnusualAmountCreated);
        c!(share_call::mint(share_addr, recipient, shares));

        evm::log(events::SharesMinted {
            identifier: outcome_id,
            shareAmount: shares,
            spender: msg_sender(),
            recipient,
            fusdcSpent: value,
        });

        Ok(shares)
    }

    #[allow(non_snake_case)]
    pub fn internal_dpm_payoff(
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
        let fusdc = self.internal_dpm_simulate_payoff(outcome_id, share_bal)?;
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

    // Shares returned by the DPM. Does not set any state.
    #[allow(unused)]
    fn internal_calc_dpm_mint(&self, outcome_id: FixedBytes<8>, value: U256) -> R<U256> {
        let n_1 = self.dpm_outcome_shares.get(outcome_id);
        let dpm_outcome_invested = self.dpm_outcome_invested.get(outcome_id);
        let m = c!(fusdc_u256_to_decimal(value));
        // Prevent them from taking less than the minimum amount to LP with.
        assert_or!(m > Decimal::from(MINIMUM_MINT_AMT), Error::TooSmallNumber);
        let m_1 = c!(fusdc_u256_to_decimal(dpm_outcome_invested));
        let n_2 = self.dpm_global_shares.get() - n_1;
        let n_1 = c!(share_u256_to_decimal(n_1));
        let m_2 = c!(fusdc_u256_to_decimal(
            self.dpm_global_invested.get() - dpm_outcome_invested
        ));
        let n_2 = c!(share_u256_to_decimal(n_2));
        share_decimal_to_u256(c!(maths::dpm_shares(m_1, m_2, n_1, n_2, m)))
    }

    pub fn internal_dpm_simulate_payoff(
        &self,
        outcome_id: FixedBytes<8>,
        share_bal: U256,
    ) -> R<U256> {
        fusdc_decimal_to_u256(maths::dpm_payoff(
            share_u256_to_decimal(share_bal)?,
            share_u256_to_decimal(self.dpm_outcome_shares.get(outcome_id))?,
            fusdc_u256_to_decimal(self.dpm_global_invested.get())?,
        )?)
    }

    pub fn internal_dpm_price(&self, id: FixedBytes<8>) -> R<U256> {
        if self.dpm_outcome_invested.get(id).is_zero() {
            return Ok(U256::ZERO);
        }
        let m_1 = c!(fusdc_u256_to_decimal(self.dpm_outcome_invested.get(id)));
        let n_1 = self.dpm_outcome_shares.get(id);
        let n_2 = c!(share_u256_to_decimal(c!(self
            .dpm_global_shares
            .get()
            .checked_sub(n_1)
            .ok_or(Error::CheckedSubOverflow(
                self.dpm_global_shares.get(),
                n_1
            )))));
        let n_1 = c!(share_u256_to_decimal(n_1));
        let m_2 = c!(fusdc_u256_to_decimal(c!(self
            .dpm_global_invested
            .get()
            .checked_sub(self.dpm_outcome_invested.get(id))
            .ok_or(Error::CheckedSubOverflow(
                self.dpm_global_invested.get(),
                self.dpm_outcome_invested.get(id)
            )))));
        fusdc_decimal_to_u256(c!(maths::dpm_price(m_1, m_2, n_1, n_2, Decimal::ZERO)))
    }
}
