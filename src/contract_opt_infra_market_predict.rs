use stylus_sdk::{alloy_primitives::*, evm};

use crate::{
    error::*, events, lockup_call, maths, nineliveslockedarb_call, timing_opt_infra_market::*,
    utils::block_timestamp, utils::msg_sender,
};

pub use crate::storage_opt_infra_market::*;

#[cfg_attr(feature = "contract-infra-market-predict", stylus_sdk::prelude::public)]
impl StorageOptimisticInfraMarket {
    /// This function must be called during the predicting period.
    /// Check the balance for a user's locked up ARB for the timestamp
    /// that this campaign starts, reverting if it hasn't started yet. If
    /// the user's tracked invested amount of Locked ARB + what they want
    /// to lock up here here exceeds their balance, then we revert. Or we
    /// add it to the tracked allocated amounts, and track their address
    /// in a list of people who've chosen to participate in the vested
    /// amount. We decay the amount that we add for the user based on
    /// the amount of seconds that have gone by so far until the end.
    /// It's possible to vote for the zero outcome, which is considered
    /// a statement that an outcome is inconclusive. If later, the contract resolves
    /// this way, then the prediction market will revert to its waiting to be called state.
    pub fn predict(&mut self, trading_addr: Address, winner: FixedBytes<8>, amt: U256) -> R<()> {
        assert_or!(self.enabled.get(), Error::NotEnabled);
        assert_or!(
            !self.campaign_call_deadline.get(trading_addr).is_zero(),
            Error::NotRegistered
        );
        let mut epochs = self.epochs.setter(trading_addr);
        let mut e = epochs.setter(self.cur_epochs.get(trading_addr));
        // We need the seconds since the whinge was recorded so we can
        // determine voting power.
        let secs_since_whinge = block_timestamp()
            .checked_sub(u64::from_be_bytes(e.campaign_when_whinged.to_be_bytes()))
            .ok_or(Error::CheckedSubOverflow)?;
        assert_or!(
            are_we_in_predicting_period(e.campaign_when_whinged.get(), block_timestamp())?,
            Error::PredictingNotStarted
        );
        let cur_user_arb_amt = lockup_call::staked_arb_bal(self.lockup_addr.get(), msg_sender())?;
        e.user_global_vested_arb
            .setter(msg_sender())
            .set(cur_user_arb_amt);
        let caller_past_votes = nineliveslockedarb_call::get_past_votes(
            self.locked_arb_token_addr.get(),
            msg_sender(),
            U256::from(self.campaign_call_begins.get(trading_addr)),
        )?;
        let voting_power = maths::infra_voting_power(amt, secs_since_whinge)?;
        // We need to check if the user's vested voting power in campaign
        // + the amount that they want to allocate does not exceed the
        // amount that they have available to them.
        let user_vested_power = e.user_global_vested_power.get(msg_sender());
        let extra_user_vested_power = user_vested_power
            .checked_add(voting_power)
            .ok_or(Error::CheckedAddOverflow)?;
        assert_or!(
            extra_user_vested_power
                < maths::infra_voting_power(caller_past_votes, secs_since_whinge)?,
            Error::NoVestedPower
        );
        e.user_global_vested_power
            .setter(msg_sender())
            .set(extra_user_vested_power);
        // Update the campaign's vested power to include the amount the
        // user just vested + what's there already.
        let new_outcome_vested_power = e
            .outcome_vested_power
            .get(winner)
            .checked_add(voting_power)
            .ok_or(Error::CheckedAddOverflow)?;
        e.outcome_vested_power
            .setter(winner)
            .set(new_outcome_vested_power);
        let user_outcome_vested_power =
            e.user_outcome_vested_power.getter(winner).get(msg_sender());
        e.user_outcome_vested_power
            .setter(winner)
            .setter(msg_sender())
            .set(user_outcome_vested_power + voting_power);
        let existing_global_power_vested = e
            .campaign_global_power_vested
            .checked_add(voting_power)
            .ok_or(Error::CheckedAddOverflow)?;
        e.campaign_global_power_vested
            .set(existing_global_power_vested);
        // Indicate to the Lockup contract that the user is unable to withdraw their funds
        // for the time of this interaction + a week.
        lockup_call::freeze(
            self.lockup_addr.get(),
            msg_sender(),
            U256::from(block_timestamp() + A_WEEK_SECS),
        )?;
        evm::log(events::UserPredicted {
            trading: trading_addr,
            predictor: msg_sender(),
            tokenAmount: amt,
            powerAmount: voting_power,
            outcome: winner,
        });
        Ok(())
    }
}
