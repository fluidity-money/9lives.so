#[storage]
#[cfg_addr(feature = "contract-infra-market", entrypoint)]
pub struct StorageInfraMarket {
    /// Was this contract created successfully?
    created: StorageU256,

    /// Is the contract enabled? Did an emergency take place?
    enabled: StorageBool,

    /// Emergency address for this contract.
    emergency_council: Address,

    /// Address of the lockup contract. This is needed to request slashing.
    lockup_addr: StorageAddress,

    /// Locked ARB token that we use for voting power.
    locked_arb_token_addr: StorageAddress,

    /// Factory address that's allowed to call this contract.
    factory_addr: StorageAddress,

    /// Currently outstanding market start timestamps with the trading address.
    /// Markets run for 3 days.
    market_starts: StorageMap<Address, StorageU64>,

    /// Power vested globally in the different outcomes cumulative.
    market_global_power_vested: StorageMap<Address, StorageU256>,

    /// Market description. This should be keccak256(<(url committee|beauty contest)>:<description>).
    market_desc: StorageMap<Address, StorageB32>,

    /// Market vested into these outcomes. trading => winner => power
    market_vested_power: StorageMap<Address, StorageMap<B8, StorageU256>>,

    /// User vested power that we update for each time they make a prediction in an outcome.
    user_vested_power: StorageMap<Address, StorageMap<B8, StorageMap<Address, StorageU256>>>,

    /// The amounts that were vested by the Predictor in this outcome. Not the power,
    /// the actual token itself.
    market_vested_user: StorageMap<Address, StorageMap<Address, StorageU256>>,

    /// Created markets that we track when someone predicts them for the first time.
    /// These are sorted on every prediction interaction.
    markets_created: StorageMap<Address, StorageVec<B8>>,

    /// Was a winner determined?
    market_winner: StorageMap<Address, StorageB8>,
}

#[cfg_attr(feature = "contract-infra-market", stylus_sdk::prelude::public)]
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

    /// Register a market. We take a small finders fee from the user who created this market.
    pub fn register(
        &mut self,
        trading_addr: Address,
        incentive_sender: Address,
        desc: B32,
        launch_ts: U256,
    ) -> Result<(), Error> {
        assert_or!(self.enabled.get(), Error::NotEnabled);
        assert_or!(
            self.market_starts.getter(trading_addr).is_zero(),
            Error::AlreadyRegistered
        );
        assert_or!(
            msg::sender() == self.factory_addr.get(),
            Error::NotFactoryContract
        );
        self.market_starts.setter(trading_addr).set(launch_ts);
        self.market_desc.setter(trading_addr).set(desc);
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
    /// that this market starts, reverting if it hasn't started yet. If
    /// the user's tracked invested amount of Locked ARB + what they want
    /// to lock up here here exceeds their balance, then we revert. Or we
    /// add it to the tracked allocated amounts, and track their address
    /// in a list of people who've chosen to participate in the vested
    /// amount. We decay the amount that we add for the user based on
    /// the amount of seconds that have gone by so far until the end.
    pub fn predict(&mut self, trading_addr: Address, winner: B8, amt: U256) -> Result<(), Error> {
        assert_or!(self.enabled.get(), Error::NotEnabled);
        assert_or!(winner != B8::ZERO, Error::MustContainOutcomes);
        let market_start_ts =
            u64::from_le_bytes(self.market_starts.getter(trading_addr).to_le_bytes());
        assert_or!(
            market_start_ts > block::timestamp()
            Error::InfraMarketHasNotStarted
        );
        assert_or!(
            market_start_ts + THREE_DAYS_SECS > block::timestamp(),
            Error::InfraMarketHasExpired
        );
        // The amount that the user was already added from their balance in the past.
        let amt_already_added = self
            .market_vested_user
            .getter(trading_addr)
            .get(msg::sender());
        // If the user is trying to allocate more than they possibly could at this timepoint,
        // we blow up.
        let amt_new_vested = amt_already_added + amt;
        assert_or!(
            amt_new_vested
                < ninelives_lockedarb_call::get_past_votes(
                    self.locked_arb_token.get(),
                    msg::sender(),
                    U256::from(market_start_ts)
                ),
            Error::InfraMarketTooMuchVested
        );
        self.market_vested_user
            .setter(trading_addr)
            .setter(msg::sender())
            .set(amt_new_vested);
        // Get the voting power that we're adding to this outcome based
        // on how many seconds have passed.
        let secs_passed = block::timestamp() - market_start_ts;
        let existing_vested_power = self.market_vested_power.getter(trading_addr).get(winner);
        // Now we need to update the global amount vested in the outcome.
        let voting_power = maths::infra_voting_power(amt, secs_passed);
        self.market_vested_power
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
        let existing_global_power = self.market_global_power_vested.get(trading_addr);
        self.market_global_power_vested
            .setter(trading_addr)
            .set(existing_global_power + voting_power);
        // Indicate to the Lockup contract that the user is unable to withdraw their funds
        // for the expiry time of this contract + a week.
        lockup_call::freeze(
            self.lockup_addr.get(),
            msg::sender(),
            U256::from(market_start_ts + THREE_DAYS_SECS),
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

    /// Checks if the time is over the time for the system to expire. If
    /// so, then we tally up the amounts invested, and we determine who
    /// the winner was, if we haven't already. We check a flag to know
    /// if this already took place. Following that, we target a specific
    /// user that we want to collect funds from.
    pub fn sweep(
        &mut self,
        trading_addr: Address,
        victim_addr: Address,
        outcomes: Vec<B8>,
    ) -> Result<(), Error> {
        assert_or!(self.enabled.get(), Error::NotEnabled);
        assert_or!(
            block::timestamp() > market_start_ts + THREE_DAYS_SECS,
            Error::InfraMarketHasNotExpired
        );
        // We check if the has sweeped flag is enabled by checking who the winner is.
        // If it isn't enabled, then we collect every identifier they specified, and
        // if it's identical (or over to accomodate for any decimal point errors),
        // we send them the finders fee, and we set the flag for the winner.
        if self.market_winner.get(trading_addr) != B8::ZERO {
            let mut voting_power_global = U256::ZERO;
            let mut current_voting_power_winner_amt = U256::ZERO;
            let mut current_voting_power_winner_id = None;
            for winner in outcomes {
                assert_or!(winner != B8::ZERO, Error::MustContainOutcomes);
                let power = self.market_vested_power.getter(trading_addr).get(winner);
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
                    voting_power_global >= self.market_global_power_vested.get(trading_addr),
                    Error::IncorrectSweepInvocation
                );
                // It should be safe to unwrap the global amount winner here.
                let voting_power_winner = current_voting_power_winner_id.unwrap();
                self.market_winner
                    .setter(trading_addr)
                    .set(voting_power_winner);
                // Looks like we owe the caller some money.
                fusdc_call::transfer(msg::sender(), INCENTIVE_AMT)?;
            }
        }
        // First we check if the target actually invested incorrectly. If they did in the past, then
        // their position in the storage for this is set to 0, as we assume that they already were
        // slashed using the other token for this.
        let victim_vested_power = self.user_vested_power.getter(target_addr).get(victim_addr);
        assert_or!(
            victim_vested_power > U256::ZERO,
            Error::UserAlreadyTargeted
        );
        // To prevent this user from being double claimed on.
        self.user_vested_power.setter(target_addr).setter(victim_addr).set(U256::ZERO);

    }
}
