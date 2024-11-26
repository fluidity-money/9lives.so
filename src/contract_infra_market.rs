use crate::storage_infra_campaign::StorageInfraMarket;

#[cfg_attr(feature = "contract-infra-campaign", stylus_sdk::prelude::public)]
impl StorageInfraMarket {
    pub fn ctor(
        &mut self,
        emergency_council: Address,
        lockup_addr: Address,
        locked_arb_token_addr: Address,
        factory_addr: Address,
    ) -> Result<(), Error> {
        assert_or!(self.enabled.is_zero(), Error::AlreadyExists);
        self.enabled.set(true);
        self.emergency_council.set(emergency_council);
        self.lockup_addr.set(lockup_addr);
        self.factory_addr.set(factory_addr);
    }

    /// Register a campaign. We take a small finders fee from the user who created this campaign.
    pub fn register(
        &mut self,
        trading_addr: Address,
        incentive_sender: Address,
        desc: B32,
        launch_ts: U256,
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
        self.campaign_starts.setter(trading_addr).set(launch_ts);
        self.campaign_desc.setter(trading_addr).set(desc);
        // Take the incentive amount to give to the user who calls sweep for the first time
        // with the correct calldata.
        fusdc_call::take_from_funder_to(incentive_sender, contract::address(), INCENTIVE_AMT)?;
        evm::emit(events::MarketCreated {
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
    pub fn predict(&mut self, trading_addr: Address, winner: B8, amt: U256) -> Result<(), Error> {
        assert_or!(self.enabled.get(), Error::NotEnabled);
        assert_or!(winner != B8::ZERO, Error::MustContainOutcomes);
        let campaign_start_ts =
            u64::from_le_bytes(self.campaign_starts.getter(trading_addr).to_le_bytes());
        assert_or!(
            campaign_start_ts > block::timestamp()
            Error::InfraMarketHasNotStarted
        );
        assert_or!(
            campaign_start_ts + THREE_DAYS_SECS > block::timestamp(),
            Error::InfraMarketHasExpired
        );
        // The amount that the user was already added from their balance in the past.
        let amt_already_added = self
            .user_vested_arb
            .getter(trading_addr)
            .get(msg::sender());
        // We track the amount of ARB that the user has in the Lockup contract
        // to punish bad behaviour here.
        let user_staked_arb_bal =
            lockup_call::staked_arb_bal(self.lockup_addr.get(), msg::sender())?;
        let existing_user_tracked_staked_arb_bal = self
            .campaign_user_vested_arb
            .getter(trading_addr)
            .get(msg::sender());
        // We check if they've previously updated this balance, and we track their new amount.
        let new_user_staked_arb_amt = if user_staked_arb_bal > existing_user_tracked_staked_arb {
            user_staked_arb_bal - existing_user_tracked_staked_arb
        } else {
            U256::ZERO
        };
        // We update the tracked amount for the user here. It's worth
        // noting that later, if someone tries to draw down from this
        // user's staked amount in the event of slashing, then we
        // actually check their locked up staked ARB balance to see if
        // it's greater than or equal to this amount here. And if it
        // isn't, then we don't send anything to prevent weird slashing
        // behaviour.
        self.campaign_user_vested_arb
            .setter(trading_addr)
            .setter(msg::sender())
            .set(user_staked_arb_bal);
        let existing_campaign_vested_arb = self.campaign_vested_arb.getter(trading_arb);
        self.campaign_global_vested_arb
            .setter(trading_addr)
            .set(existing_campaign_global_vested_arb + new_user_staked_arb_amt);
        // If the user is trying to allocate more than they possibly could at this timepoint,
        // we blow up.
        let amt_new_vested_arb = amt_already_added + amt;
        assert_or!(
            amt_new_vested
                < ninelives_lockedarb_call::get_past_votes(
                    self.locked_arb_token.get(),
                    msg::sender(),
                    U256::from(campaign_start_ts)
                ),
            Error::InfraMarketTooMuchVested
        );
        self.user_vested_arb
            .setter(trading_addr)
            .setter(msg::sender())
            .set(amt_new_vested_arb);
        // Get the voting power that we're adding to this outcome based
        // on how many seconds have passed.
        let secs_passed = block::timestamp() - campaign_start_ts;
        let existing_vested_power = self.campaign_vested_power.getter(trading_addr).get(winner);
        // Now we need to update the global amount vested in the outcome.
        let voting_power = maths::infra_voting_power(amt, secs_passed);
        self.campaign_vested_power
            .setter(trading_addr)
            .setter(winner)
            .set(existing_vested_power + voting_power);
        let user_vested_power = self
            .user_vested_power
            .getter(trading_addr)
            .getter(winner)
            .get(msg::sender());
        // We also track the amount that the user vested in this outcome
        // in terms of voting power, for figuring out the proportion of
        // the loser funds to send to them.
        self.user_vested_power
            .setter(trading_addr)
            .setter(winner)
            .setter(msg::sender())
            .set(user_vested_power + voting_power);
        let existing_global_power = self.campaign_global_power_vested.get(trading_addr);
        self.campaign_global_power_vested
            .setter(trading_addr)
            .set(existing_global_power + voting_power);
        // Indicate to the Lockup contract that the user is unable to withdraw their funds
        // for the expiry time of this contract + a week.
        lockup_call::freeze(
            self.lockup_addr.get(),
            msg::sender(),
            U256::from(campaign_start_ts + THREE_DAYS_SECS),
        )?;
        evm::emit(events::UserPredicted {
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
    /// This way, the system should be tolerable of bad behaviour and unusal
    /// interaction, say, if a user gets slashed across multiple pools at once.
    /// A bad edge case scenario in this slashing situation is funds are stuck
    /// in the other contract, as a victim's tracked vested ARB is less than
    /// what's locked in the pool. That situation is tolerable, as that amount
    /// would go to governance.
    pub fn sweep(
        &mut self,
        trading_addr: Address,
        victim_addr: Address,
        mut outcomes: Vec<B8>,
    ) -> Result<(), Error> {
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
                assert_or!(winner != B8::ZERO, Error::MustContainOutcomes);
                let power = self.campaign_vested_power.getter(trading_addr).get(winner);
                voting_power_global += power;
                // Set the current power winner to whoever's greatest.
                if power > current_voting_power_winner {
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
                fusdc_call::transfer(msg::sender(), INCENTIVE_AMT)?;
                // At this point we call the campaign that this is
                // connected to to let them know that there was a winner.
                trading_call::decide(voting_power_winner)?;
            }
        }
        if victim_addr == U256::ZERO {
	    // We don't bother to slash the user if this is the case. We
	    // just return nicely. This might be paired with the
	    // interaction with sweep to collect the incentive amount.
            return Ok(U256::ZERO);
        }
        // We check if the victim's vested power is 0. If it is, then we assume
        // that someone already claimed this victim's position!
        let victim_vested_power = self.user_vested_power.getter(target_addr).get(victim_addr);
        if victim_vested_power.is_zero() {
            return Ok(U256::ZERO);
        }
        // We check the victim's vested arb in the lockup contract, and
        // if it's not greater than or equal to what's here, then we
        // don't drain down their funds, we return! The setting of their
        // power to 0 should hopefully be enough to prevent
        // double claiming later.
        let victim_vested_arb_amt = self
            .campaign_user_vested_arb
            .getter(trading_addr)
            .get(victim_addr);
        let victim_staked_arb_amt = lockup_call::staked_arb_bal(victim_addr)?;
        if victim_vested_arb_amt > victim_staked_arb_amt {
            return Ok(U256::ZERO);
        }
        // We check the caller's share of the power vested in this losing campaign,
        // and if the victim's share of the incorrectly allocated profit is below
        // the caller's share, then we claim their amounts here. If the amount of
        // time that's exceeded is 5 days, then we're inside a "ANYTHING GOES"
        // period where someone could claim the victim's entire position without
        // beating them on the percentage of the share that's held.
        let are_we_anything_goes_period = block::timestamp() > campaign_start_ts + FIVE_DAYS_SECS;
	// Does our share of the power exceed the share they have of the
	// staked arb vested in this campaign?
	//let caller_share_of_power = self
	Ok(())
    }
}
