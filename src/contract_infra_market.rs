use stylus_sdk::{alloy_primitives::*, evm};

use crate::{
    erc20_call,
    error::*,
    events,
    fees::*,
    fusdc_call,
    immutables::*,
    lockup_call, nineliveslockedarb_call, outcome,
    timing_infra_market::*,
    trading_call,
    utils::{block_timestamp, contract_address, msg_sender},
};

pub use crate::storage_infra_market::*;

#[cfg(target_arch = "wasm32")]
use alloc::vec::Vec;

#[cfg_attr(feature = "contract-infra-market", stylus_sdk::prelude::public)]
impl StorageInfraMarket {
    pub fn ctor(
        &mut self,
        operator: Address,
        emergency_council: Address,
        lockup_addr: Address,
        locked_arb_token_addr: Address,
        factory_addr: Address,
    ) -> R<()> {
        assert_or!(!self.created.get(), Error::AlreadyConstructed);
        self.created.set(true);
        self.enabled.set(true);
        self.operator.set(operator);
        self.emergency_council.set(emergency_council);
        self.lockup_addr.set(lockup_addr);
        self.locked_arb_token_addr.set(locked_arb_token_addr);
        self.factory_addr.set(factory_addr);
        evm::log(events::InfraMarketEnabled { status: true });
        Ok(())
    }

    pub fn enable_contract(&mut self, status: bool) -> R<()> {
        assert_or!(msg_sender() == self.operator.get(), Error::NotOperator);
        self.enabled.set(status);
        evm::log(events::InfraMarketEnabled { status });
        Ok(())
    }

    /// Register a campaign. We take a small finders fee from the user who
    /// created this campaign. It's not possible to grief the factory/trading address as
    /// during setup it would attempt to register with this contract, and any
    /// client should check if the factory was registered with the trading
    /// address before voting.This could be useful in some contexts, like
    /// receiving validation that an idea is taken seriously, and the address
    /// derived using some seeds. It's our hope that there are no conflicts in
    /// practice, hopefully this isn't likely with the seeds system.
    pub fn register(
        &mut self,
        trading_addr: Address,
        desc: FixedBytes<32>,
        launch_ts: u64,
        call_deadline_ts: u64,
    ) -> R<U256> {
        assert_or!(self.enabled.get(), Error::NotEnabled);
        assert_or!(
            self.campaign_call_deadline.get(trading_addr).is_zero(),
            Error::AlreadyRegistered
        );
        // This must be set. If this should never happen, then set to the
        // maximum U256.
        assert_or!(call_deadline_ts > 0, Error::ZeroCallDeadline);
        assert_or!(!trading_addr.is_zero(), Error::ZeroTradingAddr);
        assert_or!(!desc.is_zero(), Error::ZeroDesc);
        self.campaign_call_begins
            .setter(trading_addr)
            .set(U64::from(launch_ts));
        self.campaign_desc.setter(trading_addr).set(desc);
        // We set this call deadline so that the escape hatch functionality is
        // possible to be used.
        self.campaign_call_deadline
            .setter(trading_addr)
            .set(U64::from(call_deadline_ts));
        // Take the incentive amount base amount to give to the user who
        // calls sweep for the first time with the correct calldata.
        let incentive_amts = INCENTIVE_AMT_CALL + INCENTIVE_AMT_CLOSE + INCENTIVE_AMT_DECLARE;
        fusdc_call::take_from_sender(incentive_amts)?;
        // If we experience an overflow, that's not a big deal (we should've been collecting revenue more
        // frequently). From this base amount, we should be able to send INCENTIVE_AMT_DECLARE.
        self.dao_money.set(self.dao_money.get() + incentive_amts);
        evm::log(events::MarketCreated2 {
            incentiveSender: msg_sender(),
            tradingAddr: trading_addr,
            desc,
            callDeadline: call_deadline_ts,
            launchTs: launch_ts,
        });
        Ok(incentive_amts)
    }

    // Transition this function from being in the state of the campaign being
    // able to be called, to being in a state where anyone can "whinge" about
    // the call that a user made here. Anyone can call this function, and
    // if the caller provided the correct outcome (no-one challenges it, or
    // if it's challenged, if they end up being the correct settor of the outcome).
    // A user here could feasibly lie that an outcome exists, but there'd be no
    // point, as they'd simply forfeit their bond for no reason (as everyone,
    // if the oracle functions correctly conceptually, could crush them).
    // The contract could revert to this state if the preferred outcome in the
    // betting market is 0. It can be called again if the winning outcome is 0, and
    // the deadline for the slashing period has passed.
    pub fn call(
        &mut self,
        trading_addr: Address,
        winner: FixedBytes<8>,
        incentive_recipient: Address,
    ) -> R<U256> {
        assert_or!(self.enabled.get(), Error::NotEnabled);
        assert_or!(
            !self.campaign_call_deadline.get(trading_addr).is_zero(),
            Error::NotRegistered
        );
        assert_or!(
            self.campaign_call_begins.get(trading_addr) < U64::from(block_timestamp()),
            Error::NotInsideCallingPeriod
        );
        assert_or!(
            self.campaign_call_deadline.get(trading_addr) > U64::from(block_timestamp()),
            Error::PastCallingDeadline
        );
        assert_or!(!winner.is_zero(), Error::BadWinner);
        // Though we allow the outcome to be inconclusive through the predict
        // path, we don't allow someone to set the call to the inconclusive outcome.
        // This should remain unset so someone can come in and activate the escape
        // hatch if it's needed.
        assert_or!(!winner.is_zero(), Error::InconclusiveAnswerToCall);
        // Get the current epoch. If the current winner is 0, and we
        // haven't exceeded the deadline for calling, then we assume that
        // a reset has taken place, and we increment the nonce.
        let cur_epoch = self.cur_epochs.get(trading_addr);
        let mut epochs = self.epochs.setter(trading_addr);
        // If the campaign winner was set, and it was set to 0, and we're after
        // the anything goes period, then we need to bump the epoch.
        // You would hope that this is optimised out in intermediary bytecode,
        // this access.
        let new_epoch = cur_epoch + U256::from(1);
        let mut e = {
            let e = epochs.getter(cur_epoch);
            let campaign_winner_set = e.campaign_winner_set.get();
            let campaign_winner = e.campaign_winner.get();
            if campaign_winner_set && campaign_winner.is_zero() {
                self.cur_epochs.setter(trading_addr).set(new_epoch);
                epochs.setter(new_epoch)
            } else {
                epochs.setter(cur_epoch)
            }
        };
        assert_or!(
            e.campaign_who_called.get().is_zero(),
            Error::CampaignAlreadyCalled
        );
        let incentive_recipient = if incentive_recipient.is_zero() {
            msg_sender()
        } else {
            incentive_recipient
        };
        e.campaign_when_called.set(U64::from(block_timestamp()));
        e.campaign_who_called.set(incentive_recipient);
        e.campaign_what_called.set(winner);
        fusdc_call::take_from_sender(BOND_FOR_CALL)?;
        evm::log(events::CallMade {
            tradingAddr: trading_addr,
            winner,
            incentiveRecipient: incentive_recipient,
        });
        Ok(BOND_FOR_CALL)
    }

    /// This should be called by someone after the whinging period has ended, but only if we're
    /// in a state where no-one has whinged. This will reward the caller their incentive amount
    /// and their bond.
    /// This will set the campaign_winner storage field to what was declared by the caller.
    pub fn close(&mut self, trading_addr: Address, fee_recipient: Address) -> R<U256> {
        assert_or!(self.enabled.get(), Error::NotEnabled);
        let mut epochs = self.epochs.setter(trading_addr);
        let mut e = epochs.setter(self.cur_epochs.get(trading_addr));
        assert_or!(
            !self.campaign_call_deadline.get(trading_addr).is_zero(),
            Error::NotRegistered
        );
        assert_or!(
            e.campaign_who_whinged.get().is_zero(),
            Error::SomeoneWhinged
        );
        assert_or!(
            are_we_after_whinging_period(e.campaign_when_called.get(), block_timestamp())?,
            Error::NotAfterWhinging
        );
        assert_or!(
            !e.campaign_who_called.get().is_zero(),
            Error::CampaignZeroCaller
        );
        assert_or!(!e.campaign_winner_set.get(), Error::WinnerAlreadyDeclared);
        let is_zero_epoch = self.cur_epochs.get(trading_addr).is_zero();
        let fee_recipient = if fee_recipient.is_zero() {
            msg_sender()
        } else {
            fee_recipient
        };
        // Send the caller of this function their incentive.
        // We need to prevent people from calling this unless they're at epoch
        // 0 so we don't see abuse somehow.
        let mut fees_earned = U256::ZERO;
        if self.dao_money.get() >= INCENTIVE_AMT_CLOSE && is_zero_epoch {
            self.dao_money
                .set(self.dao_money.get() - INCENTIVE_AMT_CLOSE);
            fees_earned += INCENTIVE_AMT_CLOSE;
            fusdc_call::transfer(fee_recipient, INCENTIVE_AMT_CLOSE)?;
        }
        fusdc_call::transfer(e.campaign_who_called.get(), BOND_FOR_CALL)?;
        // Send the next round of incentive amounts if we're able to do
        // so (the DAO hasn't overstepped their power here). As a backstep
        // against griefing (so we defer to Good Samaritans calling this contract,
        // we need to prevent this from happening outside nonce 0).
        if self.dao_money.get() >= INCENTIVE_AMT_CALL && self.cur_epochs.get(trading_addr).is_zero()
        {
            self.dao_money
                .set(self.dao_money.get() - INCENTIVE_AMT_CALL);
            fees_earned += INCENTIVE_AMT_CALL;
            fusdc_call::transfer(e.campaign_who_called.get(), INCENTIVE_AMT_CALL)?;
        }
        let campaign_what_called = e.campaign_what_called.get();
        e.campaign_winner.set(campaign_what_called);
        e.campaign_winner_set.set(true);
        evm::log(events::InfraMarketClosed {
            incentiveRecipient: fee_recipient,
            tradingAddr: trading_addr,
            winner: campaign_what_called,
        });
        // It should be okay to just call this contract since the factory
        // will guarantee that there's an associated contract here.
        trading_call::decide(trading_addr, campaign_what_called)?;
        Ok(fees_earned)
    }

    // Whinge about the called outcome if we're within the period to do
    // so. Take a small bond amount from the user that we intend to
    // refund once they've been deemed correct (if their preferred
    // outcome comes to light). This begins the predict stage.
    pub fn whinge(
        &mut self,
        trading_addr: Address,
        preferred_outcome: FixedBytes<8>,
        bond_recipient: Address,
    ) -> R<U256> {
        assert_or!(self.enabled.get(), Error::NotEnabled);
        assert_or!(
            !self.campaign_call_deadline.get(trading_addr).is_zero(),
            Error::NotRegistered
        );
        let bond_recipient = if bond_recipient.is_zero() {
            msg_sender()
        } else {
            bond_recipient
        };
        let mut epochs = self.epochs.setter(trading_addr);
        let mut e = epochs.setter(self.cur_epochs.get(trading_addr));
        assert_or!(
            are_we_in_whinging_period(e.campaign_when_called.get(), block_timestamp())?,
            Error::NotInWhingingPeriod
        );
        // We can't allow people to whinge the same outcome as call.
        assert_or!(
            e.campaign_what_called.get() != preferred_outcome,
            Error::CantWhingeCalled
        );
        // We only allow the inconclusive statement to be made in the predict path.
        assert_or!(!preferred_outcome.is_zero(), Error::PreferredOutcomeIsZero);
        assert_or!(
            e.campaign_who_whinged.get().is_zero(),
            Error::AlreadyWhinged
        );
        fusdc_call::take_from_sender(BOND_FOR_WHINGE)?;
        e.campaign_who_whinged.set(bond_recipient);
        e.campaign_when_whinged.set(U64::from(block_timestamp()));
        e.campaign_whinger_preferred_winner.set(preferred_outcome);
        Ok(BOND_FOR_WHINGE)
    }

    pub fn winner(&self, trading: Address) -> R<FixedBytes<8>> {
        Ok(self
            .epochs
            .getter(trading)
            .getter(self.cur_epochs.get(trading))
            .campaign_winner
            .get())
    }

    pub fn status(&self, trading_addr: Address) -> R<(u8, u64)> {
        assert_or!(self.enabled.get(), Error::NotEnabled);
        assert_or!(
            !self.campaign_call_deadline.get(trading_addr).is_zero(),
            Error::NotRegistered
        );
        let epochs = self.epochs.get(trading_addr);
        let e = epochs.getter(self.cur_epochs.get(trading_addr));
        let when_called = e.campaign_when_called.get();
        let has_called = !when_called.is_zero();
        let is_winner_set = e.campaign_winner_set.get();
        let has_whinged = !e.campaign_when_whinged.get().is_zero();
        let when_whinged = e.campaign_when_whinged.get();
        let block_timestamp = u64::from_be_bytes(block_timestamp().to_be_bytes());
        let time_since_called = block_timestamp - u64::from_be_bytes(when_called.to_be_bytes());
        let time_since_whinged = block_timestamp - u64::from_be_bytes(when_whinged.to_be_bytes());
        let (state, time) = match true {
            // If the winner wasn't called, and no-one has called, then we're callable.
            _ if !is_winner_set && !has_called => {
                let call_deadline =
                    u64::from_be_bytes(self.campaign_call_deadline.get(trading_addr).to_be_bytes());
                (
                    InfraMarketState::Callable,
                    // For the time remaining to be called, the time until the deadline is sufficient.
                    if call_deadline > block_timestamp {
                        u64::from_be_bytes((call_deadline - block_timestamp).to_be_bytes())
                    } else {
                        0
                    },
                )
            }
            // If the winner was called, but no-one has whinged, and we're within two
            // days, then we're whinging.
            _ if time_since_called < TWO_DAYS && !has_whinged => {
                (InfraMarketState::Whinging, TWO_DAYS - time_since_called)
            }
            // If the winner was called, but no-one whinged, and we're outside two days,
            // then we're callable.
            _ if time_since_called > TWO_DAYS && !has_whinged => (InfraMarketState::Closable, 0),
            // If the winner was declared, two days has passed, and we're in a state where
            // no-one whinged, then we need to assume we were closed.
            _ if time_since_called > TWO_DAYS && !has_whinged => (InfraMarketState::Closed, 0),
            // If we're within two days after the whinge, then we're in a state of predicting.
            _ if time_since_whinged < TWO_DAYS => {
                (InfraMarketState::Predicting, TWO_DAYS - time_since_whinged)
            }
            // If we're past two days after the whinge, then we're in a state of revealing.
            _ if time_since_whinged > TWO_DAYS && time_since_whinged < FOUR_DAYS => (
                InfraMarketState::Revealing,
                time_since_whinged + FOUR_DAYS - block_timestamp,
            ),
            // If we're past four days after the whinging, but no-one has declared
            // what the outcome is, then we're in a state where things are
            // declarable.
            _ if time_since_whinged > FOUR_DAYS && !e.campaign_winner_set.get() => {
                (InfraMarketState::Declarable, 0)
            }
            // If we're past four days after the whinging, and someone has declared, then we're
            // in a state where we're sweeping.
            _ if time_since_whinged > FOUR_DAYS => (InfraMarketState::Sweeping, 0),
            _ => unreachable!(), // We're in a strange internal state that should be impossible.
        };
        Ok((state.into(), time))
    }

    pub fn start_ts(&self, trading_addr: Address) -> R<u64> {
        Ok(u64::from_be_bytes(
            self.campaign_call_begins.get(trading_addr).to_be_bytes(),
        ))
    }

    pub fn end_ts(&self, trading_addr: Address) -> R<u64> {
        Ok(u64::from_be_bytes(
            self.campaign_call_deadline.get(trading_addr).to_be_bytes(),
        ))
    }

    // This function must be called during the predicting period. It's
    // possible to vote for the zero outcome, which is considered a statement
    // that an outcome is inconclusive. If later, the contract resolves this
    // way, then the prediction market will revert to its waiting to be
    // called state.
    pub fn predict(&mut self, trading_addr: Address, commit: FixedBytes<32>) -> R<()> {
        assert_or!(self.enabled.get(), Error::NotEnabled);
        assert_or!(
            !self.campaign_call_deadline.get(trading_addr).is_zero(),
            Error::NotRegistered
        );
        let mut epochs = self.epochs.setter(trading_addr);
        let mut e = epochs.setter(self.cur_epochs.get(trading_addr));
        assert_or!(
            are_we_in_predicting_period(e.campaign_when_whinged.get(), block_timestamp())?,
            Error::PredictingNotStarted
        );
        // We don't allow the user to participate here if they have 0
        // balance at that point in history.
        let past_bal = nineliveslockedarb_call::get_past_votes(
            self.locked_arb_token_addr.get(),
            msg_sender(),
            U256::from(self.campaign_call_begins.get(trading_addr)),
        )?;
        assert_or!(past_bal > U256::ZERO, Error::ZeroBal);
        // We check to see if the user's Staked ARB is less than what they had at this point.
        // If that's the case, then we don't want to take their donation here, since something
        // is amiss, and we can't slash them properly.
        assert_or!(
            {
                let cur_bal = nineliveslockedarb_call::balance_of(
                    self.locked_arb_token_addr.get(),
                    msg_sender(),
                )?;
                cur_bal >= past_bal
            },
            Error::StakedArbUnusual
        );
        assert_or!(
            e.commitments.get(msg_sender()).is_zero(),
            Error::AlreadyCommitted
        );
        assert_or!(!commit.is_zero(), Error::NotAllowedZeroCommit);
        e.commitments.setter(msg_sender()).set(commit);
        // Indicate to the Lockup contract that the user is unable to withdraw their funds
        // for the time of this interaction + a week.
        lockup_call::freeze(
            self.lockup_addr.get(),
            msg_sender(),
            block_timestamp() + A_WEEK_SECS,
        )?;
        evm::log(events::Committed {
            trading: trading_addr,
            predictor: msg_sender(),
            commitment: commit,
        });
        Ok(())
    }

    pub fn cur_outcome_vested_arb(&self, trading_addr: Address, outcome: FixedBytes<8>) -> R<U256> {
        let epochs = self.epochs.getter(trading_addr);
        let e = epochs.get(self.cur_epochs.get(trading_addr));
        Ok(e.outcome_vested_arb.get(outcome))
    }

    pub fn reveal(
        &mut self,
        trading_addr: Address,
        committer_addr: Address,
        outcome: FixedBytes<8>,
        seed: U256,
    ) -> R<()> {
        assert_or!(self.enabled.get(), Error::NotEnabled);
        assert_or!(
            !self.campaign_call_deadline.get(trading_addr).is_zero(),
            Error::NotRegistered
        );
        let mut epochs = self.epochs.setter(trading_addr);
        let mut e = epochs.setter(self.cur_epochs.get(trading_addr));
        assert_or!(
            are_we_in_commitment_reveal_period(e.campaign_when_whinged.get(), block_timestamp())?,
            Error::NotInCommitReveal(
                u64::from_be_bytes(e.campaign_when_whinged.get().to_be_bytes()),
                block_timestamp()
            )
        );
        assert_or!(
            e.reveals.get(committer_addr).is_zero(),
            Error::AlreadyRevealed
        );
        let commit = e.commitments.get(committer_addr);
        // We can create the random numb/er the same way that we do it for proxies.
        let hash = outcome::create_commit(committer_addr, outcome, seed);
        assert_or!(commit == hash, Error::CommitNotTheSame);
        let bal = nineliveslockedarb_call::get_past_votes(
            self.locked_arb_token_addr.get(),
            msg_sender(),
            U256::from(self.campaign_call_begins.get(trading_addr)),
        )?;
        // Extra check to see if the user was slashed in the interim between calling this function.
        assert_or!(
            {
                let cur_bal = nineliveslockedarb_call::balance_of(
                    self.locked_arb_token_addr.get(),
                    msg_sender(),
                )?;
                let past_bal = nineliveslockedarb_call::get_past_votes(
                    self.locked_arb_token_addr.get(),
                    msg_sender(),
                    U256::from(self.campaign_call_begins.get(trading_addr)),
                )?;
                cur_bal >= past_bal
            },
            Error::StakedArbUnusual
        );
        // Overflows aren't likely, since we're taking ARB as the token.
        let global_vested_arb = e.global_vested_arb.get();
        e.global_vested_arb.set(global_vested_arb + bal);
        let outcome_vested_arb = e.outcome_vested_arb.get(outcome);
        e.outcome_vested_arb
            .setter(outcome)
            .set(outcome_vested_arb + bal);
        e.user_vested_arb.setter(msg_sender()).set(bal);
        e.reveals.setter(msg_sender()).set(outcome);
        evm::log(events::CommitmentRevealed {
            trading: trading_addr,
            revealer: committer_addr,
            caller: msg_sender(),
            outcome,
            bal,
        });
        Ok(())
    }

    /// "Declare" a winner, by providing the outcomes that were in use, along
    /// with a fee recipient to collect the fee for providing this correct calldata
    /// to.
    pub fn declare(
        &mut self,
        trading_addr: Address,
        mut outcomes: Vec<FixedBytes<8>>,
        fee_recipient: Address,
    ) -> R<U256> {
        assert_or!(self.enabled.get(), Error::NotEnabled);
        assert_or!(
            !self.campaign_call_deadline.get(trading_addr).is_zero(),
            Error::NotRegistered
        );
        let mut epochs = self.epochs.setter(trading_addr);
        let mut e = epochs.setter(self.cur_epochs.get(trading_addr));
        // This can be called at any time now after the fact for the current epoch.
        assert_or!(
            !e.campaign_when_whinged.get().is_zero(),
            Error::WhingedTimeUnset
        );
        assert_or!(
            block_timestamp()
                > u64::from_le_bytes(e.campaign_when_whinged.get().to_le_bytes()) + FOUR_DAYS,
            Error::NotReadyToDeclare
        );
        // We check if the has declared flag is enabled by checking who the winner is.
        // If it isn't enabled, then we collect every identifier they specified, and
        // if it's identical (or over to accomodate for any decimal point errors),
        // we send them the finders fee, and we set the flag for the winner.
        // We track the yield of the recipient and the caller so we can give it
        // to them at the end of this function.
        assert_or!(!e.campaign_winner_set.get(), Error::CampaignWinnerSet);
        outcomes.sort();
        outcomes.dedup();
        assert_or!(!outcomes.is_empty(), Error::OutcomesEmpty);
        let current_winner_id = {
            let mut lowest_arb = U256::MAX;
            let mut current_winner_amt = U256::ZERO;
            let mut arb_acc = U256::ZERO;
            let mut current_winner_id = None;
            for winner in outcomes {
                // To find the winner, we count the ARB invested in each outcome, and if
                // we find that the lowest amount is greater than the amount outstanding
                // minus the amount invested, then we assume they supplied the correct
                // amount.
                let arb = e.outcome_vested_arb.get(winner);
                arb_acc += arb;
                // Set the current arb winner to whoever's greatest.
                if arb > current_winner_amt {
                    current_winner_amt = arb;
                    current_winner_id = Some(winner);
                }
                // Set the minimum amount now.
                if arb < lowest_arb && !arb.is_zero() {
                    lowest_arb = arb;
                }
            }
            // If the least amount of ARB invested is greater than or equal to the
            // amount remaining, then we know the user supplied the correct amount.
            assert_or!(
                lowest_arb >= e.global_vested_arb.get() - arb_acc,
                Error::IncorrectSweepInvocation
            );
            current_winner_id
        };
        // At this point, if we're not Some with the winner choice here,
        // then we need to default to what the caller provided during the calling
        // stage. This could happen if the liquidity is even across every outcome.
        // If that's the case, we're still going to slash people who bet poorly later.
        // The assumption is that the whinging bond is the differentiating amount
        // in this extreme scenario.
        let voting_power_winner = match current_winner_id {
            Some(v) => v,
            None => {
                // In a REALLY extreme scenario, what could happen is that
                // there was a challenge to the default outcome but no-one called it
                // so there was no period of whinging. In this extreme circumstance,
                // we default to the whinger's preferred outcome, since they posted
                // a bond that would presumably tip the scales in their favour.
                e.campaign_whinger_preferred_winner.get()
            }
        };
        e.campaign_winner.set(voting_power_winner);
        e.campaign_winner_set.set(true);
        // This is the amount returned to the caller after running this code.
        let mut caller_yield_taken = U256::ZERO;
        {
            // We send the caller incentive if we can.
            let caller_incentive = if self.dao_money.get() >= INCENTIVE_AMT_CALL
                && self.cur_epochs.get(trading_addr).is_zero()
            {
                self.dao_money
                    .set(self.dao_money.get() - INCENTIVE_AMT_CALL);
                INCENTIVE_AMT_CALL
            } else {
                U256::ZERO
            };
            let bond_amts = BOND_FOR_WHINGE + BOND_FOR_CALL + caller_incentive;
            // If the whinger was correct, we owe them their bond + the caller's bond + the caller's incentive.
            if voting_power_winner == e.campaign_whinger_preferred_winner.get() {
                fusdc_call::transfer(e.campaign_who_whinged.get(), bond_amts)?;
            }
            // If the caller was correct, we owe them their bond + the whinger's bond + the caller's incentive.
            if voting_power_winner == e.campaign_what_called.get() {
                fusdc_call::transfer(e.campaign_who_called.get(), bond_amts)?;
            }
        }
        // Looks like we owe the fee recipient some money. This should only be the
        // case in the happy path (we're on nonce 0). This is susceptible to griefing
        // if someone were to intentionally trigger this behaviour, but the risk for them
        // is the interaction with activating the bond and the costs associated.
        if self.dao_money.get() >= INCENTIVE_AMT_DECLARE
            && self.cur_epochs.get(trading_addr).is_zero()
        {
            self.dao_money
                .set(self.dao_money.get() - INCENTIVE_AMT_DECLARE);
            fusdc_call::transfer(fee_recipient, INCENTIVE_AMT_DECLARE)?;
            caller_yield_taken += INCENTIVE_AMT_DECLARE;
        }
        // If we're in the zero epoch, we should send the caller of this function
        // the amount that the closer would get.
        if self.dao_money.get() >= INCENTIVE_AMT_CLOSE
            && self.cur_epochs.get(trading_addr).is_zero()
        {
            self.dao_money
                .set(self.dao_money.get() - INCENTIVE_AMT_CLOSE);
            fusdc_call::transfer(fee_recipient, INCENTIVE_AMT_CLOSE)?;
            caller_yield_taken += INCENTIVE_AMT_CLOSE;
        }
        // We need to check if the arb staked is 0, and if it is, then we need to reset
        // to the beginning after the sweep period has passed.
        if voting_power_winner.is_zero() {
            // Since the outcome is in an indeterminate state, we need to give up the
            // notion that someone set the who called argument. We need to activate
            // the next epoch, so that that we must begin the next calling period
            // once the anything goes period has concluded. The call function should
            // check that that's needing to be the case by checking if the set winner is
            // 0.
            e.campaign_who_called.set(Address::ZERO);
        } else {
            // At this point we call the campaign that this is
            // connected to let them know that there was a winner.
            trading_call::decide(trading_addr, voting_power_winner)?;
        }
        Ok(caller_yield_taken)
    }

    /// Slash incorrectly betting users' funds to the reward pool.
    pub fn sweep(
        &mut self,
        trading_addr: Address,
        epoch_no: U256,
        victim_addr: Address,
        fee_recipient_addr: Address,
    ) -> R<U256> {
        assert_or!(self.enabled.get(), Error::NotEnabled);
        assert_or!(
            !self.campaign_call_deadline.get(trading_addr).is_zero(),
            Error::NotRegistered
        );
        // Make sure that this sweeping is taking place after the epoch has passed.
        assert_or!(
            self.cur_epochs.get(trading_addr) >= epoch_no,
            Error::InvalidEpoch
        );
        let mut epochs = self.epochs.setter(trading_addr);
        let mut e = epochs.setter(epoch_no);
        // This can be called at any time now after the fact for the current epoch.
        assert_or!(
            !e.campaign_when_whinged.get().is_zero(),
            Error::WhingedTimeUnset
        );
        assert_or!(e.campaign_winner_set.get(), Error::WinnerUnset);
        assert_or!(
            block_timestamp()
                > u64::from_le_bytes(e.campaign_when_whinged.get().to_le_bytes()) + FOUR_DAYS,
            Error::NotInsideSweepingPeriod
        );
        // Let's check if the victim still has their funds (no-one added them to
        // the pool to be claimed)
        assert_or!(
            !e.user_vested_arb.get(victim_addr).is_zero(),
            Error::BadVictim
        );
        // Let's check that they bet correctly. If they did, then we should
        // revert, since the caller made a mistake.
        assert_or!(
            !e.commitments.get(victim_addr).is_zero()
                && e.reveals.get(victim_addr) != e.campaign_winner.get(),
            Error::BadVictim
        );
        // We need to take the amount invested to this contract. This should be
        // easily done, as the slash function will take their amount and send it
        // to us. We can then add it to the outstanding pot.
        let amt = lockup_call::slash(
            self.lockup_addr.get(),
            victim_addr,
            e.user_vested_arb.get(victim_addr),
            contract_address(),
        )?;
        //amt - (amt * infra fee);
        let amt_fee = (amt * FEE_POT_INFRA_PCT) / FEE_SCALING;
        let amt_no_fee = c!(amt.checked_sub(amt_fee).ok_or(Error::CheckedSubOverflow));
        {
            let p = e.redeemable_pot_existing.get();
            e.redeemable_pot_existing
                .set(p.checked_add(amt_no_fee).ok_or(Error::CheckedAddOverflow)?);
        }
        {
            let p = e.redeemable_pot_outstanding.get();
            e.redeemable_pot_outstanding
                .set(p.checked_add(amt_no_fee).ok_or(Error::CheckedAddOverflow)?);
        }
        if amt_fee > U256::ZERO {
            erc20_call::transfer(STAKED_ARB_ADDR, fee_recipient_addr, amt_fee)?;
        }
        Ok(amt_fee)
    }

    // Capture fees from the global pot that the user partook in.
    pub fn capture(
        &mut self,
        trading_addr: Address,
        epoch_no: U256,
        fee_recipient: Address,
    ) -> R<U256> {
        assert_or!(self.enabled.get(), Error::NotEnabled);
        assert_or!(
            !self.campaign_call_deadline.get(trading_addr).is_zero(),
            Error::NotRegistered
        );
        // Make sure that this sweeping is taking place after the epoch has passed.
        assert_or!(
            self.cur_epochs.get(trading_addr) >= epoch_no,
            Error::InvalidEpoch
        );
        let mut epochs = self.epochs.setter(trading_addr);
        let mut e = epochs.setter(epoch_no);
        assert_or!(
            e.reveals.get(msg_sender()) == e.campaign_winner.get(),
            Error::NotWinner
        );
        assert_or!(
            !e.redeemable_user_has_claimed.get(msg_sender()),
            Error::PotAlreadyClaimed
        );
        let scaling = U256::from(1e12 as u64);
        let pct_of_winnings = (e.user_vested_arb.get(msg_sender()) * scaling)
            / e.outcome_vested_arb.get(e.campaign_winner.get());
        let pot_available = (e.redeemable_pot_existing.get() * pct_of_winnings) / scaling;
        e.redeemable_user_has_claimed.setter(msg_sender()).set(true);
        let amt_to_send = if pot_available > e.redeemable_pot_outstanding.get() {
            // How did this happen? We send it regardless.
            e.redeemable_pot_outstanding.get()
        } else {
            pot_available
        };
        if amt_to_send > U256::ZERO {
            erc20_call::transfer(STAKED_ARB_ADDR, fee_recipient, amt_to_send)?;
        }
        Ok(amt_to_send)
    }

    /// If this is being called, we're in a really bad situation where the
    /// calling deadline has been passed.
    /// In this possibility, it's time to indicate to the Trading contract
    /// that we're in this indeterminate position, which should defer to the
    /// DAO that this is the case.
    pub fn escape(&mut self, trading_addr: Address) -> R<()> {
        // This is only possible to be used if we're in the calling stage (either
        // the winner hasn't been set, or the winner has been set and it's 0, and
        // the calling deadline has passed). We don't reward people for calling
        // this, as the funds associated with the interaction with this market
        // are presumably spendable, and the amounts are liquid that were
        // invested through the Lockup contract. This would only benefit anyone
        // that these funds are associated with, or operational costs. Funds for
        // this should be set aside in this situation by the beneficiary of this
        // contract, but since the cost of calling is likely quite slim, it's
        // low.
        assert_or!(self.enabled.get(), Error::NotEnabled);
        let epochs = self.epochs.getter(trading_addr);
        let e = epochs.getter(self.cur_epochs.get(trading_addr));
        let indeterminate_winner = e.campaign_winner_set.get() && e.campaign_winner.get().is_zero();
        let is_calling_period = e.campaign_what_called.get().is_zero();
        assert_or!(
            self.campaign_call_deadline.get(trading_addr) < U64::from(block_timestamp())
                && !self.campaign_has_escaped.get(trading_addr)
                && (indeterminate_winner || is_calling_period),
            Error::CannotEscape
        );
        trading_call::escape(trading_addr)?;
        self.campaign_has_escaped.setter(trading_addr).set(true);
        evm::log(events::CampaignEscaped {
            tradingAddr: trading_addr,
        });
        Ok(())
    }
}

#[cfg(all(test, not(target_arch = "wasm32")))]
mod test {
    use super::*;
    use crate::{
        error::panic_guard,
        utils::{strat_address, strat_fixed_bytes, strat_small_u256},
    };
    use proptest::prelude::*;
    proptest! {
        #[test]
        fn test_infra_cant_be_recreated(mut c in strat_storage_infra_market()) {
            c.created.set(false);
            let z = Address::ZERO;
            c.ctor(z, z, z, z, z).unwrap();
            panic_guard(|| {
                assert_eq!(Error::AlreadyConstructed, c.ctor(z, z, z, z, z).unwrap_err());
            });
        }

        #[test]
        fn test_infra_operator_pause_no_run(
            mut c in strat_storage_infra_market(),
            register_trading_addr in strat_address(),
            register_desc in strat_fixed_bytes::<32>(),
            register_launch_ts in any::<u64>(),
            register_call_deadline in any::<u64>(),
            call_trading_addr in strat_address(),
            call_winner in strat_fixed_bytes::<8>(),
            call_incentive_recipient in strat_address(),
            close_trading_addr in strat_address(),
            close_trading_recipient in strat_address(),
            whinge_trading_addr in strat_address(),
            whinge_preferred_outcome in strat_fixed_bytes::<8>(),
            whinge_bond_recipient in strat_address(),
            predict_trading_addr in strat_address(),
            predict_commit in strat_fixed_bytes::<32>(),
            reveal_committer_addr in strat_address(),
            reveal_trading_addr in strat_address(),
            reveal_outcome in strat_fixed_bytes::<8>(),
            reveal_seed in strat_small_u256(),
            _sweep_outcomes in proptest::collection::vec(strat_fixed_bytes::<8>(), 0..8),
            sweep_trading_addr in strat_address(),
            sweep_victim_addr in strat_address(),
            sweep_fee_recipient_addr in strat_address(),
            escape_trading_addr in strat_address()
        ) {
            c.operator.set(msg_sender());
            c.enable_contract(false).unwrap();
            let sweep_epoch_no = U256::ZERO;
            panic_guard(|| {
                let rs = [
                    c.register(
                        register_trading_addr,
                        register_desc,
                        register_launch_ts,
                        register_call_deadline
                    )
                        .unwrap_err(),
                    c.call(call_trading_addr, call_winner, call_incentive_recipient)
                        .unwrap_err(),
                    c.close(close_trading_addr, close_trading_recipient)
                        .unwrap_err(),
                    c.whinge(whinge_trading_addr, whinge_preferred_outcome, whinge_bond_recipient)
                        .unwrap_err(),
                    c.predict(predict_trading_addr, predict_commit)
                        .unwrap_err(),
                    c.reveal(reveal_committer_addr, reveal_trading_addr, reveal_outcome, reveal_seed)
                        .unwrap_err(),
                    c.sweep(
                        sweep_trading_addr,
                        sweep_epoch_no,
                        sweep_victim_addr,
                        sweep_fee_recipient_addr,
                    )
                        .unwrap_err(),
                    c.escape(escape_trading_addr).unwrap_err()
                ];
                for (i, r) in rs.into_iter().enumerate() {
                    assert_eq!(Error::NotEnabled, r, "{i}");
                }
            })
        }
    }
}
