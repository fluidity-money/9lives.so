use stylus_sdk::{alloy_primitives::*, evm};

use crate::{
    error::*,
    events,
    fees::FEE_SPN_MINT_PCT,
    immutables::*,
    maths,
    storage_trading::*,
    utils::{block_timestamp, msg_sender},
};

use alloc::vec::Vec;

#[cfg(feature = "trading-backend-dpm")]
use crate::factory_call;

// CalcFees, determined by the contract state.
#[derive(Debug, PartialEq, Clone)]
pub struct CalcFees {
    pub fee_for_creator: U256,
    pub fee_for_minter: U256,
    pub fee_for_lp: U256,
    pub fee_for_referrer: U256,
    pub fee_for_protocol: U256,
}

impl StorageTrading {
    pub fn internal_ctor(
        &mut self,
        mut outcomes: Vec<FixedBytes<8>>,
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
        {
            // Prevent someone from constructing this with reused shares.
            let outcome_before_len = outcomes.len();
            outcomes.sort();
            outcomes.dedup();
            assert_or!(outcomes.len() == outcome_before_len, Error::BadTradingCtor);
        }
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
            DAO_EARN_ADDR
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

    pub fn is_not_done_predicting(&self) -> bool {
        self.when_decided.get().is_zero()
            && !self.is_shutdown.get()
            && self.time_ending.get() > U64::from(block_timestamp())
    }

    pub fn require_not_done_predicting(&self) -> R<()> {
        assert_or!(self.is_not_done_predicting(), Error::DoneVoting);
        Ok(())
    }

    pub fn internal_decide(&mut self, outcome: FixedBytes<8>) -> R<U256> {
        let oracle_addr = self.oracle.get();
        assert_or!(msg_sender() == oracle_addr, Error::NotOracle);
        assert_or!(self.when_decided.get().is_zero(), Error::AlreadyDecided);
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

    /// Calculate fees based on the configuration in the pool, including
    /// whether the action has a referrer.
    pub fn calculate_fees(&self, value: U256, is_buy: bool) -> R<(U256, CalcFees)> {
        let fee_for_creator = maths::calc_fee(value, self.fee_creator.get())?;
        let fee_for_minter = maths::calc_fee(value, self.fee_minter.get())?;
        let fee_for_lp = if is_buy {
            maths::calc_fee(value, self.fee_lp.get())?
        } else {
            maths::calc_lp_sell_fee(value, self.fee_lp.get())?
        };
        let fee_for_referrer = maths::calc_fee(value, self.fee_referrer.get())?;
        let fee_for_protocol = if !self.is_protocol_fee_disabled.get() {
            maths::calc_fee(value, FEE_SPN_MINT_PCT)?
        } else {
            U256::ZERO
        };
        // fee_for_creator + fee_for_minter +  fee_for_lp + fee_for_referrer + fee_for_protocol
        let fee_cum = fee_for_creator
            .checked_add(fee_for_minter)
            .and_then(|x| fee_for_lp.checked_add(x))
            .and_then(|x| fee_for_referrer.checked_add(x))
            .and_then(|x| fee_for_protocol.checked_add(x))
            .ok_or(Error::CheckedAddOverflow)?;
        Ok((
            fee_cum,
            CalcFees {
                fee_for_creator,
                fee_for_minter,
                fee_for_lp,
                fee_for_referrer,
                fee_for_protocol,
            },
        ))
    }

    /// Calculate and set fees where possible, including the AMM fee weight
    /// if we're a AMM. Returns the cumulative fee, inclusive of the different
    /// kinds. If the is buy flag is true, then the code will return a normal
    /// fee * amount value. If it's set to false, then it'll return the behaviour that
    /// sell expects, and the caller is expected to add it themselves to their value.
    pub fn calculate_and_set_fees(
        &mut self,
        value: U256,
        is_buy: bool,
        referrer: Address,
    ) -> R<U256> {
        let (
            fee_cum,
            CalcFees {
                fee_for_creator,
                fee_for_minter,
                fee_for_lp,
                fee_for_referrer,
                fee_for_protocol,
            },
        ) = self.calculate_fees(value, is_buy)?;
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
        // TODO: we don't do anything with this -- yet. No-one internal to the
        // team should be deploying contracts with this enabled for now.
        let _ = fee_for_minter;
        self.amm_fees_collected_weighted.set(
            self.amm_fees_collected_weighted
                .get()
                .checked_add(fee_for_lp)
                .ok_or(Error::CheckedAddOverflow)?,
        );
        // If the referrer isn't set, then we send it to the DAO.
        {
            let dao_fees = fee_for_protocol
                + if referrer.is_zero() {
                    fee_for_referrer
                } else {
                    U256::ZERO
                };
            let fees_so_far = self.fees_owed_addresses.get(DAO_EARN_ADDR);
            self.fees_owed_addresses.setter(DAO_EARN_ADDR).set(
                fees_so_far
                    .checked_add(dao_fees)
                    .ok_or(Error::CheckedAddOverflow)?,
            );
        }
        if !referrer.is_zero() && fee_for_referrer > U256::ZERO {
            let fees_so_far = self.fees_owed_addresses.get(referrer);
            evm::log(events::ReferrerEarnedFees {
                referrer,
                fees: fee_for_referrer,
                volume: value,
            });
            self.fees_owed_addresses.setter(referrer).set(
                fees_so_far
                    .checked_add(fee_for_referrer)
                    .ok_or(Error::CheckedAddOverflow)?,
            );
        }
        Ok(fee_cum)
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
        fees::FEE_SPN_MINT_PCT,
        maths, strat_storage_trading,
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
        fn test_fee_addition_ok_selling(
            fee_for_creator in (0..=100).prop_map(U256::from),
            fee_for_minter in (0..=100).prop_map(U256::from),
            fee_for_lp in (0..=100).prop_map(U256::from),
            fee_for_referrer in (0..=100).prop_map(U256::from),
            value in strat_medium_u256(),
            referrer_addr in strat_address_not_empty(),
            is_buy in any::<bool>(),
            mut c in strat_storage_trading(false)
        ) {
            c.fee_creator.set(fee_for_creator);
            c.fee_minter.set(fee_for_minter);
            c.fee_lp.set(fee_for_lp);
            c.fee_referrer.set(fee_for_referrer);
            c.is_protocol_fee_disabled.set(false);
            let lp_fee = if is_buy {
                maths::calc_fee(value, fee_for_lp).unwrap()
            } else {
                maths::calc_lp_sell_fee(value, fee_for_lp).unwrap()
            };
            let cum_fee =
                maths::calc_fee(value, fee_for_creator).unwrap() +
                maths::calc_fee(value, fee_for_minter).unwrap() +
                lp_fee +
                maths::calc_fee(value, fee_for_referrer).unwrap() +
                maths::calc_fee(value, FEE_SPN_MINT_PCT).unwrap();
            let fee = c.calculate_and_set_fees(value, is_buy, referrer_addr).unwrap();
            assert_eq!(cum_fee, fee);
            assert_eq!(lp_fee, c.amm_fees_collected_weighted.get());
        }
    }
}
