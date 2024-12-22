use stylus_sdk::{alloy_primitives::*, evm};

use crate::{
    erc20_call,
    error::*,
    events,
    fees::*,
    fusdc_call,
    immutables::*,
    lockup_call, nineliveslockedarb_call, proxy,
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
        incentive_sender: Address,
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
        // Only the factory can use this, so it should be safe to have
        // taking from a user.
        assert_or!(
            msg_sender() == self.factory_addr.get(),
            Error::NotFactoryContract
        );
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
        fusdc_call::take_from_funder_to(incentive_sender, contract_address(), INCENTIVE_AMT_BASE)?;
        // If we experience an overflow, that's not a big deal (we should've been collecting revenue more
        // frequently).
        self.dao_money
            .set(self.dao_money.get() + INCENTIVE_AMT_BASE);
        evm::log(events::MarketCreated2 {
            incentiveSender: incentive_sender,
            tradingAddr: trading_addr,
        });
        Ok(INCENTIVE_AMT_BASE)
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
    ) -> R<()> {
        assert_or!(self.enabled.get(), Error::NotEnabled);
        assert_or!(
            self.campaign_call_begins.get(trading_addr) < U64::from(block_timestamp()),
            Error::NotInsideCallingPeriod
        );
        assert_or!(
            !self.campaign_call_deadline.get(trading_addr).is_zero(),
            Error::NotRegistered
        );
        // Though we allow the outcome to be inconclusive through the predict
        // path, we don't allow someone to set the call to the inconclusive outcome.
        // This should remain unset so someone can come in and activate the escape
        // hatch if it's needed.
        assert_or!(!winner.is_zero(), Error::InconclusiveAnswerToCall);
        // We're in bad shape, we need to assume someone will call the escape hatch function.
        assert_or!(
            self.campaign_call_deadline.get(trading_addr) > U64::from(block_timestamp()),
            Error::PastCallingDeadline
        );
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
            let campaign_when_whinged = e.campaign_when_whinged.get();
            if campaign_winner_set
                && campaign_winner.is_zero()
                && are_we_after_anything_goes(campaign_when_whinged, block_timestamp())?
            {
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
        evm::log(events::CallMade {
            tradingAddr: trading_addr,
            winner,
            incentiveRecipient: incentive_recipient,
        });
        Ok(())
    }

    /// This should be called by someone after the whinging period has ended, but only if we're
    /// in a state where no-one has whinged. This will reward the caller their incentive amount.
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
        assert_or!(!e.campaign_winner_set.get(), Error::WinnerAlreadyDeclared);
        let fee_recipient = if fee_recipient.is_zero() {
            msg_sender()
        } else {
            fee_recipient
        };
        // Send the caller of this function their incentive.
        // We need to prevent people from calling this unless they're at epoch
        // 0 so we don't see abuse somehow.
        if self.dao_money.get() >= INCENTIVE_AMT_CLOSE
            && self.cur_epochs.get(trading_addr).is_zero()
        {
            self.dao_money
                .set(self.dao_money.get() - INCENTIVE_AMT_CLOSE);
            fusdc_call::transfer(fee_recipient, INCENTIVE_AMT_CLOSE)?;
        }
        // Send the user who originally called this outcome their
        // incentive for doing so, and for being right.
        let campaign_who_called = e.campaign_who_called.get();
        // We make sure to send the fee for calling to either the user who
        // called it, or this caller.
        let fees_earned = INCENTIVE_AMT_CLOSE
            + if campaign_who_called.is_zero() {
                INCENTIVE_AMT_CALL
            } else {
                U256::ZERO
            };
        // Send the next round of incentive amounts if we're able to do
        // so (the DAO hasn't overstepped their power here). As a backstep
        // against griefing (so we defer to Good Samaritans calling this contract,
        // we need to prevent this from happening outside nonce 0).
        if self.dao_money.get() >= INCENTIVE_AMT_CALL && self.cur_epochs.get(trading_addr).is_zero()
        {
            self.dao_money
                .set(self.dao_money.get() - INCENTIVE_AMT_CALL);
            fusdc_call::transfer(
                if campaign_who_called.is_zero() {
                    fee_recipient
                } else {
                    campaign_who_called
                },
                INCENTIVE_AMT_CALL,
            )?;
        }
        let campaign_what_called = e.campaign_what_called.get();
        e.campaign_winner.set(campaign_what_called);
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
        assert_or!(!commit.is_zero(), Error::NotAllowedZeroCommit);
        e.commitments.setter(trading_addr).set(commit);
        // Indicate to the Lockup contract that the user is unable to withdraw their funds
        // for the time of this interaction + a week.
        lockup_call::freeze(
            self.lockup_addr.get(),
            msg_sender(),
            U256::from(block_timestamp() + A_WEEK_SECS),
        )?;
        // We check to see if the user's Staked ARB is less than what they had at this point.
        // If that's the case, then we don't want to take their donation here, since something
        // is amiss, and we can't slash them properly.
        assert_or!(
            nineliveslockedarb_call::get_past_votes(
                self.locked_arb_token_addr.get(),
                msg_sender(),
                U256::from(self.campaign_call_begins.get(trading_addr)),
            )? <= lockup_call::staked_arb_bal(self.lockup_addr.get(), msg_sender())?,
            Error::StakedArbUnusual
        );
        evm::log(events::Committed {
            trading: trading_addr,
            predictor: msg_sender(),
            commitment: commit,
        });
        Ok(())
    }

    pub fn reveal(
        &mut self,
        committer_addr: Address,
        trading_addr: Address,
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
            Error::NotInCommitReveal
        );
        assert_or!(
            e.reveals.get(committer_addr).is_zero(),
            Error::AlreadyRevealed
        );
        let commit = e.commitments.get(trading_addr);
        // We can create the random numb/er the same way that we do it for proxies.
        let hash = proxy::create_identifier(&[
            committer_addr.as_slice(),
            outcome.as_slice(),
            &seed.to_le_bytes::<32>(),
        ]);
        assert_or!(commit == hash, Error::CommitNotTheSame);
        let bal = nineliveslockedarb_call::get_past_votes(
            self.locked_arb_token_addr.get(),
            msg_sender(),
            U256::from(self.campaign_call_begins.get(trading_addr)),
        )?;
        assert_or!(bal > U256::ZERO, Error::ZeroBal);
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

    pub fn sweep(
        &mut self,
        trading_addr: Address,
        victim_addr: Address,
        mut outcomes: Vec<FixedBytes<8>>,
        on_behalf_of_addr: Address,
        fee_recipient_addr: Address,
    ) -> R<(U256, U256)> {
        assert_or!(self.enabled.get(), Error::NotEnabled);
        assert_or!(
            !self.campaign_call_deadline.get(trading_addr).is_zero(),
            Error::NotRegistered
        );
        let mut epochs = self.epochs.setter(trading_addr);
        let mut e = epochs.setter(self.cur_epochs.get(trading_addr));
        assert_or!(
            are_we_in_sweeping_period(e.campaign_when_whinged.get(), block_timestamp())?,
            Error::NotInsideSweepingPeriod
        );
        outcomes.sort();
        outcomes.dedup();
        // We check if the has sweeped flag is enabled by checking who the winner is.
        // If it isn't enabled, then we collect every identifier they specified, and
        // if it's identical (or over to accomodate for any decimal point errors),
        // we send them the finders fee, and we set the flag for the winner.
        // We track the yield of the recipient and the caller so we can give it
        // to them at the end of this function.
        let mut caller_yield_taken = U256::ZERO;
        let mut on_behalf_of_yield_taken = U256::ZERO;
        if !e.campaign_winner_set.get() {
            let mut arb_global = U256::ZERO;
            let mut current_winner_amt = U256::ZERO;
            let mut current_winner_id = None;
            for winner in outcomes {
                let arb = e.outcome_vested_arb.get(winner);
                arb_global += arb;
                // Set the current arb winner to whoever's greatest.
                if arb > current_winner_amt {
                    current_winner_amt = arb;
                    current_winner_id = Some(winner);
                }
            }
            // If the amount that we tracked as ARB is greater than what we
            // tracked so far, then we know that the user specified the correct
            // amount.
            assert_or!(
                arb_global >= e.global_vested_arb.get(),
                Error::IncorrectSweepInvocation
            );
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
            assert_eq!(
                voting_power_winner,
                e.campaign_whinger_preferred_winner.get()
            );
            // If the whinger was correct, we owe them their bond.
            if voting_power_winner == e.campaign_whinger_preferred_winner.get() {
                fusdc_call::transfer(e.campaign_who_whinged.get(), BOND_FOR_WHINGE)?;
            }
            // Looks like we owe the fee recipient some money. This should only be the
            // case in the happy path (we're on nonce 0). This is susceptible to griefing
            // if someone were to intentionally trigger this behaviour, but the risk for them
            // is the interaction with activating the bond and the costs associated.
            if self.dao_money.get() >= INCENTIVE_AMT_SWEEP
                && self.cur_epochs.get(trading_addr).is_zero()
            {
                self.dao_money
                    .set(self.dao_money.get() - INCENTIVE_AMT_SWEEP);
                fusdc_call::transfer(fee_recipient_addr, INCENTIVE_AMT_SWEEP)?;
                caller_yield_taken += INCENTIVE_AMT_SWEEP;
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
                // connected to let them know that there was a winner. Hopefully
                // someone called shutdown on the contract in the past to prevent
                // users from calling Longtail constantly.
                trading_call::decide(trading_addr, voting_power_winner)?;
            }
        }
        // The winning outcome in this campaign.
        let campaign_winner = e.campaign_winner.get();
        if victim_addr.is_zero() {
            // We don't bother to slash the user if this is the case. We
            // just return nicely. This might be paired with the
            // interaction with sweep to collect the incentive amount.
            return Ok((caller_yield_taken, U256::ZERO));
        }
        // We check if the victim's vested Arb is 0. If it is, then we assume
        // that someone already claimed this victim's position!
        if e.user_vested_arb.get(victim_addr).is_zero() {
            return Ok((caller_yield_taken, on_behalf_of_yield_taken));
        }
        // Let's check that they bet correctly. If they did, then we should
        // revert, since the caller made a mistake.
        assert_or!(
            !e.commitments.get(victim_addr).is_zero()
                && e.reveals.get(victim_addr) == e.campaign_winner.get(),
            Error::BadVictim
        );
        // We check the victim's vested arb in the lockup contract, and
        // if it's not greater than or equal to what was tracked at the
        // time of minting, then we don't drain down their funds, we return!
        // The setting of their Staked ARB to 0 should hopefully be enough to
        // prevent double claiming later.
        if e.user_vested_arb.get(victim_addr)
            > lockup_call::staked_arb_bal(self.lockup_addr.get(), victim_addr)?
        {
            return Ok((caller_yield_taken, on_behalf_of_yield_taken));
        }
        // We need to now take the amount that the victim bet in the
        // incorrect outcome, and we need to dilute their arb down by
        // the amount of the global arb relative to the winning arb.
        // The winner gets the losing outcome on a pro-rata basis, and
        // we dilute down their share of the winning.
        // If Alex has 30% of the winning ARB invested...
        let pct_of_winning_amt_caller = (e.user_vested_arb.get(on_behalf_of_addr) * SCALING_FACTOR)
            / e.outcome_vested_arb.get(campaign_winner);
        // If Erik has 20% of the winning ARB invested...
        let pct_of_losing_amt_victim = (e.user_vested_arb.get(victim_addr) * SCALING_FACTOR)
            / (e.global_vested_arb.get() - e.outcome_vested_arb.get(campaign_winner));
        // If we're inside a "ANYTHING GOES" period where someone could claim the
        // victim's entire position without beating them on the percentage of the share
        // that's held.
        let are_we_anything_goes_period =
            are_we_in_anything_goes_period(e.campaign_when_whinged.get(), block_timestamp())?;
        let can_winner_claim_victim =
            are_we_anything_goes_period || pct_of_winning_amt_caller >= pct_of_losing_amt_victim;
        let remaining_winner_pct = pct_of_winning_amt_caller - pct_of_losing_amt_victim;
        assert_or!(can_winner_claim_victim, Error::VictimCannotClaim);
        // Prevent the victim from being drained again, and dilute the caller's voting
        // arb down in line with the amount the victim had.
        e.user_vested_arb.setter(victim_addr).set(U256::ZERO);
        if pct_of_winning_amt_caller >= pct_of_losing_amt_victim {
            let winner_arb = e.user_vested_arb.get(on_behalf_of_addr);
            e.user_vested_arb.setter(on_behalf_of_addr).set(
                winner_arb
                    .checked_sub((winner_arb * remaining_winner_pct) / SCALING_FACTOR)
                    .ok_or(Error::CheckedSubOverflow)?,
            );
        }
        // Transfer the victim's entire staked ARB position to the
        // caller. Make sure noone can drain from this user in this
        // contract again! We shouldn't need to worry about overflow here due
        // to the amount being sent being quite low and passing other checks.
        let confiscated =
            lockup_call::confiscate(self.lockup_addr.get(), victim_addr, contract_address())?;
        if confiscated.is_zero() {
            return Ok((caller_yield_taken, on_behalf_of_yield_taken));
        }
        // Now we send the confiscated amount and a small fee to the
        // caller for being first.
        if on_behalf_of_addr == fee_recipient_addr {
            on_behalf_of_yield_taken +=
                lockup_call::confiscate(self.lockup_addr.get(), victim_addr, on_behalf_of_addr)?;
        } else {
            let confiscate_fee = (confiscated * FEE_OTHER_CALLER_CONFISCATE_PCT) / FEE_SCALING;
            let confiscate_no_fee = confiscated - confiscate_fee;
            on_behalf_of_yield_taken += confiscate_no_fee;
            erc20_call::transfer(STAKED_ARB_ADDR, on_behalf_of_addr, confiscate_no_fee)?;
            erc20_call::transfer(STAKED_ARB_ADDR, fee_recipient_addr, confiscate_fee)?;
            caller_yield_taken += confiscate_fee;
            on_behalf_of_yield_taken += confiscate_no_fee;
        }
        Ok((caller_yield_taken, on_behalf_of_yield_taken))
    }

    /// If this is being called, we're in a really bad situation where the
    /// calling deadline has been passed, and no-one has called the function.
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
            self.campaign_call_deadline.get(trading_addr) > U64::from(block_timestamp())
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
            register_incentive_sender in strat_address(),
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
            sweep_trading_addr in strat_address(),
            sweep_victim_addr in strat_address(),
            sweep_outcomes in proptest::collection::vec(strat_fixed_bytes::<8>(), 0..8),
            sweep_on_behalf_of_addr in strat_address(),
            sweep_fee_recipient_addr in strat_address(),
            escape_trading_addr in strat_address()
        ) {
            c.operator.set(msg_sender());
            c.enable_contract(false).unwrap();
            panic_guard(|| {
                let rs = [
                    c.register(
                        register_trading_addr,
                        register_incentive_sender,
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
                        sweep_victim_addr,
                        sweep_outcomes,
                        sweep_on_behalf_of_addr,
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
