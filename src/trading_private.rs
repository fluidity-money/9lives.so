use stylus_sdk::{alloy_primitives::*, evm};

use crate::{
    error::*,
    events,
    fees::{FEE_SCALING, FEE_SPN_MINT_PCT},
    immutables::*,
    maths,
    storage_trading::*,
    utils::{block_timestamp, msg_sender},
};

use alloc::vec::Vec;

#[cfg(feature = "trading-backend-dpm")]
use crate::factory_call;

impl StorageTrading {
    pub fn internal_ctor(
        &mut self,
        outcomes: Vec<FixedBytes<8>>,
        oracle: Address,
        time_start: u64,
        time_ending: u64,
        fee_recipient: Address,
        share_impl: Address,
        should_buffer_time: bool,
        fee_creator: u64,
        fee_lp: u64,
        fee_minter: u64,
        fee_referrer: u64,
    ) -> R<()> {
        assert_or!(!self.created.get(), Error::AlreadyConstructed);
        // Make sure that the user hasn't given us any zero values, or the end
        // date isn't in the past, in places that don't make sense!
        assert_or!(
            time_ending >= block_timestamp()
                && !share_impl.is_zero()
                && time_ending > time_start
                && outcomes.len() >= 2,
            Error::BadTradingCtor
        );
        // We don't allow the fees to exceed 10% (100).
        assert_or!(
            fee_creator < 100 && fee_minter < 100 && fee_lp < 100 && fee_referrer < 100,
            Error::ExcessiveFee
        );
        unsafe {
            // We don't need to reset this, but it's useful for testing, and
            // is presumably pretty cheap.
            self.outcome_list.set_len(0);
        }
        // We assume that the sender is the factory.
        self.created.set(true);
        self.factory_addr.set(msg_sender());
        self.share_impl.set(share_impl);
        // If the fee recipient is zero, then we set it to the DAO address.
        self.fee_recipient.set(if fee_recipient.is_zero() {
            DAO_ADDR
        } else {
            fee_recipient
        });
        self.time_start.set(U64::from(time_start));
        self.time_ending.set(U64::from(time_ending));
        self.oracle.set(oracle);
        self.should_buffer_time.set(should_buffer_time);
        self.fee_creator.set(U256::from(fee_creator));
        self.fee_minter.set(U256::from(fee_minter));
        self.fee_lp.set(U256::from(fee_lp));
        self.fee_referrer.set(U256::from(fee_referrer));
        #[cfg(feature = "trading-backend-dpm")]
        return self.internal_dpm_ctor(outcomes);
        #[cfg(not(feature = "trading-backend-dpm"))]
        return self.internal_amm_ctor(outcomes);
    }

    pub fn internal_shutdown(&mut self) -> R<U256> {
        // Notify Longtail to pause trading on every outcome pool.
        assert_or!(!self.is_shutdown.get(), Error::IsShutdown);
        // We only do the shutdown if the backend is the DPM!
        #[cfg(feature = "trading-backend-dpm")]
        factory_call::disable_shares(
            self.factory_addr.get(),
            &self.outcome_ids_iter().collect::<Vec<_>>(),
        )?;
        self.is_shutdown.set(true);
        Ok(U256::ZERO)
    }

    pub fn require_not_done_predicting(&self) -> R<()> {
        assert_or!(
            self.when_decided.get().is_zero()
                && !self.is_shutdown.get()
                && self.time_ending.get() > U64::from(block_timestamp()),
            Error::DoneVoting
        );
        Ok(())
    }

    pub fn internal_decide(&mut self, outcome: FixedBytes<8>) -> R<U256> {
        let oracle_addr = self.oracle.get();
        assert_or!(msg_sender() == oracle_addr, Error::NotOracle);
        assert_or!(self.when_decided.get().is_zero(), Error::NotTradingContract);
        // Set the outcome that's winning as the winner!
        self.winner.set(outcome);
        self.when_decided.set(U64::from(block_timestamp()));
        evm::log(events::OutcomeDecided {
            identifier: outcome,
            oracle: oracle_addr,
        });
        // We call shutdown in the event this wasn't called in the past.
        if !self.is_shutdown.get() {
            self.internal_shutdown()?;
        }
        Ok(U256::ZERO)
    }

    /// Calculate and set fees where possible, including the AMM fee weight
    /// if we're a AMM. Returns the amount remaining.
    pub fn calculate_and_set_fees(&mut self, value: U256, referrer: Address) -> R<U256> {
        let fee_for_creator = maths::mul_div_round_up(value, self.fee_creator.get(), FEE_SCALING)?;
        let fee_for_minter = maths::mul_div_round_up(value, self.fee_minter.get(), FEE_SCALING)?;
        let fee_for_lp = maths::mul_div_round_up(value, self.fee_lp.get(), FEE_SCALING)?;
        let fee_for_referrer = if !referrer.is_zero() {
            maths::mul_div_round_up(value, self.fee_referrer.get(), FEE_SCALING)?
        } else {
            U256::ZERO
        };
        let fee_protocol = maths::mul_div_round_up(value, FEE_SPN_MINT_PCT, FEE_SCALING)?;
        if !fee_protocol.is_zero() {
            let fees_so_far = self.fees_owed_addresses.get(DAO_ADDR);
            self.fees_owed_addresses
                .setter(self.fee_recipient.get())
                .set(
                    fees_so_far
                        .checked_add(fee_protocol)
                        .ok_or(Error::CheckedAddOverflow)?,
                );
        }
        // fee_for_creator + fee_for_minter +  fee_for_lp + fee_for_referrer + fee_for_protocol
        let fee_cum = fee_for_creator
            .checked_add(fee_for_lp)
            .and_then(|x| fee_for_referrer.checked_add(x))
            .ok_or(Error::CheckedAddOverflow)?;
        // Start to allocate some fees to the creator and to the referrer.
        if !fee_for_creator.is_zero() {
            let fees_so_far = self.fees_owed_addresses.get(self.fee_recipient.get());
            self.fees_owed_addresses
                .setter(self.fee_recipient.get())
                .set(
                    fees_so_far
                        .checked_add(fee_for_creator)
                        .ok_or(Error::CheckedAddOverflow)?,
                );
        }
        if !fee_for_referrer.is_zero() {
            let fees_so_far = self.fees_owed_addresses.get(referrer);
            self.fees_owed_addresses.setter(referrer).set(
                fees_so_far
                    .checked_add(fee_for_referrer)
                    .ok_or(Error::CheckedAddOverflow)?,
            );
        }
        #[cfg(feature = "trading-backend-amm")]
        self.amm_fee_weight.set(
            self.amm_fee_weight
                .get()
                .checked_add(fee_cum)
                .ok_or(Error::CheckedAddOverflow)?,
        );
        // It will never be the case that the fee exceeds the amount here, but
        // this good programming regardless to check.
        let value = value
            .checked_sub(fee_cum)
            .ok_or(Error::CheckedSubOverflow)?;
        Ok(value)
    }
}

#[test]
#[cfg(feature = "trading-backend-dpm")]
fn test_is_dpm() {
    assert!(c.is_dpm());
}

#[test]
#[cfg(feature = "trading-backend-amm")]
fn test_is_amm() {
    assert!(!StorageTrading::default().is_dpm());
}

#[cfg(all(test, not(target_arch = "wasm32")))]
mod proptesting {
    use crate::{
        fees::FEE_SCALING,
        strat_storage_trading,
        utils::{strat_address_not_empty, strat_medium_u256},
    };

    use stylus_sdk::alloy_primitives::U256;

    use proptest::prelude::*;

    proptest! {
        #[test]
        #[cfg(feature = "trading-backend-dpm")]
        fn test_dpm_ctor_only_two_outcomes_1(
            mut c in strat_storage_trading(),
            outcomes in proptest::collection::vec(any::<FixedBytes<8>>(), 2..4)
        ) {
            let mut args = default_ctor_args();
            args.outcomes = outcomes;
            panic_guard(|| {
                let r = c.ctor(args);
                if outcomes.len() == 2 {
                    assert!(r.is_ok());
                } else {
                    assert_eq!(Error::BadTradingCtor, r.unwrap_err());
                }
            })
        }

        #[test]
        fn test_fee_addition_ok(
            fee_for_creator in (0..=100).prop_map(U256::from),
            fee_for_lp in (0..=100).prop_map(U256::from),
            fee_for_referrer in (0..=100).prop_map(U256::from),
            value in strat_medium_u256(),
            referrer_addr in strat_address_not_empty(),
            mut c in strat_storage_trading(false)
        ) {
            c.fee_creator.set(fee_for_creator);
            c.fee_lp.set(fee_for_lp);
            c.fee_referrer.set(fee_for_referrer);
            let expected_fee_creator = fee_for_creator
                .checked_mul(value)
                .unwrap()
                .checked_div(FEE_SCALING)
                .unwrap();
            let expected_fee_lp = fee_for_lp
                .checked_mul(value)
                .unwrap()
                .checked_div(FEE_SCALING)
                .unwrap();
            let expected_fee_referrer = fee_for_referrer
                .checked_mul(value)
                .unwrap()
                .checked_div(FEE_SCALING)
                .unwrap();
            let expected_cum_fee =
                expected_fee_creator + expected_fee_lp + expected_fee_referrer;
            // In our tests, we tolerate a difference.
            let tol = U256::from(10);
            let got = c.calculate_and_set_fees(value, referrer_addr).unwrap();
            assert!(
                got >= (value - expected_cum_fee) - tol &&
                got <= (value - expected_cum_fee) + tol
            );
            assert!(
                c.amm_fee_weight.get() >= expected_cum_fee - tol &&
                c.amm_fee_weight.get() <= expected_cum_fee + tol
            );
        }
    }
}
