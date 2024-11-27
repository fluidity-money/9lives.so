use stylus_sdk::{alloy_primitives::*, block, contract, evm, msg};

use crate::{
    error::Error, events, fusdc_call, immutables::*, lockup_call, maths, nineliveslockedarb_call,
    trading_call,
};

pub use crate::storage_infra_market::*;

#[cfg_attr(
    feature = "contract-infrastructure-market",
    stylus_sdk::prelude::public
)]
impl StorageInfraMarket {
    pub fn ctor(
        &mut self,
        emergency_council: Address,
        lockup_addr: Address,
        locked_arb_token_addr: Address,
        factory_addr: Address,
    ) -> Result<(), Error> {
        assert_or!(!self.created.get(), Error::AlreadyConstructed);
        self.created.set(true);
        self.enabled.set(true);
        self.emergency_council.set(emergency_council);
        self.lockup_addr.set(lockup_addr);
        self.locked_arb_token_addr.set(locked_arb_token_addr);
        self.factory_addr.set(factory_addr);
        Ok(())
    }

    /// Register a campaign. We take a small finders fee from the user who created this campaign.
    pub fn register(
        &mut self,
        trading_addr: Address,
        incentive_sender: Address,
        desc: FixedBytes<32>,
        launch_ts: u64,
    ) -> Result<(), Error> {
        assert_or!(self.enabled.get(), Error::NotEnabled);
        assert_or!(
            self.campaign_starts.getter(trading_addr).is_zero(),
            Error::AlreadyRegistered
        );
        assert_or!(
            msg::sender() == self.factory_addr.get(),
            Error::NotFactoryContract
        );
        self.campaign_starts.setter(trading_addr).set(U64::from(launch_ts));
        self.campaign_desc.setter(trading_addr).set(desc);
        // Take the incentive amount base amount to give to the user who
        // calls sweep for the first time with the correct calldata.
        fusdc_call::take_from_funder_to(incentive_sender, contract::address(), INCENTIVE_AMT_BASE)?;
        evm::log(events::MarketCreated {
            incentiveSender: incentive_sender,
            tradingAddr: trading_addr,
        });
        Ok(())
    }

    /// Check the balance for a user's locked up ARB for the timestamp
    /// that this campaign starts, reverting if it hasn't started yet. If
    /// the user's tracked invested amount of Locked ARB + what they want
    /// to lock up here here exceeds their balance, then we revert. Or we
    /// add it to the tracked allocated amounts, and track their address
    /// in a list of people who've chosen to participate in the vested
    /// amount. We decay the amount that we add for the user based on
    /// the amount of seconds that have gone by so far until the end.
    pub fn predict(
        &mut self,
        trading_addr: Address,
        winner: FixedBytes<8>,
        amt: U256,
    ) -> Result<(), Error> {
        assert_or!(self.enabled.get(), Error::NotEnabled);
        assert_or!(!winner.is_zero(), Error::MustContainOutcomes);
        let campaign_start_ts =
            u64::from_le_bytes(self.campaign_starts.getter(trading_addr).to_le_bytes());
        assert_or!(
            campaign_start_ts > block::timestamp(),
            Error::InfraMarketHasNotStarted
        );
        assert_or!(
            campaign_start_ts + THREE_DAYS_SECS > block::timestamp(),
            Error::InfraMarketHasExpired
        );
        let cur_user_arb_amt = lockup_call::staked_arb_bal(self.lockup_addr.get(), msg::sender())?;
        self.user_global_vested_arb
            .setter(trading_addr)
            .setter(msg::sender())
            .set(cur_user_arb_amt);
        let secs_passed = block::timestamp() - campaign_start_ts;
        let caller_past_votes = nineliveslockedarb_call::get_past_votes(
            self.locked_arb_token_addr.get(),
            msg::sender(),
            U256::from(campaign_start_ts),
        )?;
        let voting_power = maths::infra_voting_power(amt, secs_passed)?;
        // We need to check if the user's vested voting power in campaign
        // + the amount that they want to allocate does not exceed the
        // amount that they have available to them.
        let user_vested_power = self
            .user_global_vested_power
            .getter(trading_addr)
            .get(msg::sender());
        let extra_user_vested_power = user_vested_power
            .checked_add(voting_power)
            .ok_or(Error::CheckedAddOverflow)?;
        assert_or!(
            extra_user_vested_power < maths::infra_voting_power(caller_past_votes, secs_passed)?,
            Error::NoVestedPower
        );
        self.user_global_vested_power
            .setter(trading_addr)
            .setter(msg::sender())
            .set(extra_user_vested_power);
        // Update the campaign's vested power to include the amount the
        // user just vested + what's there already.
        let new_campaign_vested_power = self
            .campaign_vested_power
            .getter(trading_addr)
            .get(winner)
            .checked_add(voting_power)
            .ok_or(Error::CheckedAddOverflow)?;
        self.campaign_vested_power
            .setter(trading_addr)
            .setter(winner)
            .set(new_campaign_vested_power);
        let user_campaign_vested_power = self
            .user_campaign_vested_power
            .getter(trading_addr)
            .getter(winner)
            .get(msg::sender());
        self.user_campaign_vested_power
            .setter(trading_addr)
            .setter(winner)
            .setter(msg::sender())
            .set(user_campaign_vested_power + voting_power);
        let existing_global_power_vested = self
            .campaign_global_power_vested
            .getter(trading_addr)
            .checked_add(voting_power)
            .ok_or(Error::CheckedAddOverflow)?;
        self.campaign_global_power_vested
            .setter(trading_addr)
            .set(existing_global_power_vested);
        // Indicate to the Lockup contract that the user is unable to withdraw their funds
        // for the expiry time of this contract + a week.
        lockup_call::freeze(
            self.lockup_addr.get(),
            msg::sender(),
            U256::from(campaign_start_ts + A_WEEK_SECS),
        )?;
        evm::log(events::UserPredicted {
            trading: trading_addr,
            predictor: msg::sender(),
            tokenAmount: amt,
            powerAmount: voting_power,
            outcome: winner,
        });
        Ok(())
    }

    /// Checks if the time is over the time for this infra campaign to expire. If
    /// so, then we tally up the amounts invested, and we determine who
    /// the winner was, if we haven't already. We check a flag to know
    /// if this already took place. Following that, we target a specific
    /// user that we want to collect funds from. The caller of this function,
    /// if they're the first user to call this, receives a small amount allocated
    /// by the creator of the prediction campaign. The caller to sweep provides the
    /// outcome identifiers, which are used to reconstruct the amounts that were
    /// invested in each outcome. If the user passes these incorrectly, this code
    /// reverts. If they don't pass an address of a victim to take funds from,
    /// this code assumes they're not scalping funds from users, and just
    /// sends them the incentive money that the creator supplied.
    /// There are three stages to this interaction: the first stage where the campaign
    /// has expired (after 3 days), and normal sweeping behaviour is possible.
    /// During this stage, it's possible to claim funds from the bad bettors
    /// in this campaign if your share of the winning outcome is greater than their
    /// share in the losing outcome. After 5 days, the "anything goes" period
    /// begins, where it's possible for anyone to claim the entire amounts
    /// that a bad bettor made regardless if you beat them on the share held
    /// by them relative to yours, provided that you participated in this campaign.
    /// After 7 days, it's not possible to sweep bad outcomes any more.
    /// There is a check inside this code that prevents a user's position from
    /// being taken from them if their recorded share in this pool is either
    /// 0, or that their recorded ARB allocated to this outcome is more than
    /// their reported current amount of ARB in the rest of the lockup contract.
    /// Once they take the amount from a victim, their global voting power
    /// is reduced by the amount that the victim had. This way, they can
    /// continue to slash users, and presumably, the caller was identified as
    /// having correctly bet already, so it's safe for the check that their position
    /// bet on the correct outcome to start to become odd.
    /// This way, the system should be tolerable of bad behaviour and unusal
    /// interaction, say, if a user gets slashed across multiple pools at once.
    /// A bad edge case scenario in this slashing situation is funds are stuck
    /// in the other contract, as a victim's tracked vested ARB is less than
    /// what's locked in the pool. That situation is tolerable, as that amount
    /// would go to governance potentially, after being taken by another user.
    pub fn sweep(
        &mut self,
        trading_addr: Address,
        victim_addr: Address,
        mut outcomes: Vec<FixedBytes<8>>,
        recipient: Address,
    ) -> Result<U256, Error> {
        assert_or!(self.enabled.get(), Error::NotEnabled);
        let campaign_start_ts =
            u64::from_le_bytes(self.campaign_starts.getter(trading_addr).to_le_bytes());
        assert_or!(
            block::timestamp() > campaign_start_ts + THREE_DAYS_SECS,
            Error::InfraMarketHasNotExpired
        );
        // If someone is trying to sweep a week after the end date, they shouldn't be able
        // to incase that causes something strange somewhere.
        assert_or!(
            block::timestamp() > campaign_start_ts + A_WEEK_SECS,
            Error::InfraMarketWindowClosed
        );
        outcomes.sort();
        outcomes.dedup();
        // We check if the has sweeped flag is enabled by checking who the winner is.
        // If it isn't enabled, then we collect every identifier they specified, and
        // if it's identical (or over to accomodate for any decimal point errors),
        // we send them the finders fee, and we set the flag for the winner.
        if self.campaign_winner.get(trading_addr).is_zero() {
            let mut voting_power_global = U256::ZERO;
            let mut current_voting_power_winner_amt = U256::ZERO;
            let mut current_voting_power_winner_id = None;
            for winner in outcomes {
                assert_or!(!winner.is_zero(), Error::MustContainOutcomes);
                let power = self.campaign_vested_power.getter(trading_addr).get(winner);
                voting_power_global += power;
                // Set the current power winner to whoever's greatest.
                if power > current_voting_power_winner_amt {
                    current_voting_power_winner_amt = power;
                    current_voting_power_winner_id = Some(winner);
                }
                // If the amount that we tracked as the power is greater than what we
                // tracked so far, then we know that the user specified the correct
                // amount.
                assert_or!(
                    voting_power_global >= self.campaign_global_power_vested.get(trading_addr),
                    Error::IncorrectSweepInvocation
                );
                // It should be safe to unwrap the global amount winner here.
                let voting_power_winner = current_voting_power_winner_id.unwrap();
                self.campaign_winner
                    .setter(trading_addr)
                    .set(voting_power_winner);
                // Looks like we owe the caller some money.
                fusdc_call::transfer(recipient, INCENTIVE_AMT_SWEEP)?;
                // At this point we call the campaign that this is
                // connected to to let them know that there was a winner. Hopefully
                // someone called shutdown on the contract in the past to prevent
                // users from calling Longtail constantly.
                trading_call::decide(trading_addr, voting_power_winner)?;
            }
        }
        // The winning outcome in this campaign.
        let campaign_winner = self.campaign_winner.get(trading_addr);
        if victim_addr.is_zero() {
            // We don't bother to slash the user if this is the case. We
            // just return nicely. This might be paired with the
            // interaction with sweep to collect the incentive amount.
            return Ok(U256::ZERO);
        }
        // We check if the victim's vested power is 0. If it is, then we assume
        // that someone already claimed this victim's position! Or, they never bet
        // wrong, and someone is trying to abuse this system.
        let victim_global_vested_power = self
            .user_global_vested_power
            .getter(trading_addr)
            .get(victim_addr);
        if victim_global_vested_power.is_zero() {
            return Ok(U256::ZERO);
        }
        // We check the victim's vested arb in the lockup contract, and
        // if it's not greater than or equal to what's here, then we
        // don't drain down their funds, we return! The setting of their
        // power to 0 should hopefully be enough to prevent
        // double claiming later.
        let victim_vested_arb_amt = self
            .user_global_vested_arb
            .getter(trading_addr)
            .get(victim_addr);
        let victim_staked_arb_amt =
            lockup_call::staked_arb_bal(self.lockup_addr.get(), victim_addr)?;
        if victim_vested_arb_amt > victim_staked_arb_amt {
            return Ok(U256::ZERO);
        }
        // We check the caller's share of the power vested in this losing campaign,
        // and if the victim's share of the incorrectly allocated profit is below
        // the caller's share, then we claim their amounts here. First, check if the
        // user actually bet incorrectly by checking
        // if their share of the winning outcome is less than 50% of all
        // of their voting power.
        let victim_correct_power_amt = self
            .user_campaign_vested_power
            .getter(trading_addr)
            .getter(campaign_winner)
            .get(victim_addr);
        let global_power_amt = self
            .user_global_vested_power
            .getter(trading_addr)
            .get(victim_addr);
        //if 50 > victim bet on winning amt / victim bet on everything
        let victim_bet_incorrectly =
            U256::from(50) > (FIFTY_PCT_SCALING * victim_correct_power_amt) / global_power_amt;
        // If the victim did not bet incorrectly, we assume the user made
        // a mistake in calling this function, and break out.
        assert_or!(victim_bet_incorrectly, Error::BadVictim);
        // We need to now take the amount that the victim bet in the
        // incorrect outcome, and we need to dilute their power down by
        // the amount of the global power relative to the winning power.
        // So if 51% of the power invested was in the correct outcome,
        // then we need to take 49% power away from the victim, then do
        // our comparison to see if it's valid for the claimer to take
        // money from the victim.
        //campaign vested power / global vested power
        let pct_of_global_power_is_winner = self
            .campaign_vested_power
            .getter(trading_addr)
            .get(campaign_winner)
            .checked_mul(SCALING_FACTOR)
            .ok_or(Error::CheckedMulOverflow)?
            .checked_div(self.campaign_global_power_vested.get(trading_addr))
            .ok_or(Error::CheckedDivOverflow)?;
        //victim victed power * (1 - global power percent)
        let diluted_victim_power = self
            .user_global_vested_power
            .getter(trading_addr)
            .get(victim_addr)
            .checked_mul(SCALING_FACTOR)
            .ok_or(Error::CheckedMulOverflow)?
            .checked_mul(SCALING_FACTOR - pct_of_global_power_is_winner)
            .ok_or(Error::CheckedDivOverflow)?
            .checked_div(SCALING_FACTOR)
            .ok_or(Error::CheckedDivOverflow)?;
        // Now that we know the amounts allocated, let's test if the
        // caller can claim this amount by looking at the power of the
        // caller.
        let caller_winning_power = self
            .user_campaign_vested_power
            .getter(trading_addr)
            .getter(campaign_winner)
            .get(msg::sender());
        // If the amount of time that's exceeded is 5 days, then we're
        // inside a "ANYTHING GOES" period where someone could claim the
        // victim's entire position without beating them on the
        // percentage of the share that's held.
        let are_we_anything_goes_period = block::timestamp() > campaign_start_ts + FIVE_DAYS_SECS;
        let can_winner_claim_victim =
            are_we_anything_goes_period || caller_winning_power > diluted_victim_power;
        assert_or!(can_winner_claim_victim, Error::VictimCannotClaim);
        // Prevent the victim from being drained again, and dilute the caller's voting
        // power down in line with the amount the victim had.
        self.user_global_vested_power
            .setter(trading_addr)
            .setter(victim_addr)
            .set(U256::ZERO);
        self.user_global_vested_power
            .setter(trading_addr)
            .setter(msg::sender())
            .set(caller_winning_power - diluted_victim_power);
        // Transfer the victim's entire staked ARB position to the
        // caller. Make sure noone can drain from this user in this
        // contract again!
        lockup_call::confiscate(self.lockup_addr.get(), victim_addr, recipient)
    }
}
