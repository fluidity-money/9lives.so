use stylus_sdk::{alloy_primitives::*, contract, evm};

use crate::{
    error::*, events, fees::*, fusdc_call, timing_opt_infra_market::*, trading_call,
    utils::block_timestamp, utils::msg_sender,
};

pub use crate::storage_opt_infra_market::*;

#[cfg_attr(feature = "contract-infra-market-extras", stylus_sdk::prelude::public)]
impl StorageOptimisticInfraMarket {
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
        Ok(())
    }

    /// Register a campaign. We take a small finders fee from the user who
    /// created this campaign. This could be feasibly registered to a
    /// non-existent trading address, to a address that could be created in
    /// the future. It's not possible to grief the factory/trading address as
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
        fusdc_call::take_from_funder_to(incentive_sender, contract::address(), INCENTIVE_AMT_BASE)?;
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
    // if the oracle functions correctly conceptually, would crush them).
    // The contract could revert to this state if the preferred outcome in the
    // betting market is 0. It can be called if the winning outcome is 0, and
    // the deadline for the slashing period has passed.
    pub fn call(
        &mut self,
        trading_addr: Address,
        winner: FixedBytes<8>,
        incentive_recipient: Address,
    ) -> R<()> {
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
            self.campaign_call_begins.get(trading_addr) < U64::from(block_timestamp()),
            Error::NotInsideCallingPeriod
        );
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

    pub fn winner(&self, trading: Address) -> R<FixedBytes<8>> {
        Ok(self
            .epochs
            .getter(trading)
            .getter(self.cur_epochs.get(trading))
            .campaign_winner
            .get())
    }

    pub fn market_power_vested(&self, trading: Address, outcome: FixedBytes<8>) -> R<U256> {
        Ok(self
            .epochs
            .getter(trading)
            .getter(self.cur_epochs.get(trading))
            .outcome_vested_power
            .get(outcome))
    }

    pub fn global_power_vested(&self, trading: Address) -> R<U256> {
        Ok(self
            .epochs
            .getter(trading)
            .getter(self.cur_epochs.get(trading))
            .campaign_global_power_vested
            .get())
    }

    pub fn user_power_vested(&self, trading: Address, spender: Address) -> R<U256> {
        Ok(self
            .epochs
            .getter(trading)
            .getter(self.cur_epochs.get(trading))
            .user_global_vested_power
            .get(spender))
    }

    /// This should be called by someone after the whinging period has ended, but only if we're
    /// in a state where no-one has whinged. This will reward the caller their incentive amount.
    /// This will set the campaign_winner storage field to what was declared by the caller.
    pub fn close(&mut self, trading_addr: Address, fee_recipient: Address) -> R<U256> {
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
            are_we_after_whinging_period(e.campaign_when_whinged.get(), block_timestamp())?,
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
    ) -> R<()> {
        assert_or!(
            !self.campaign_call_deadline.get(trading_addr).is_zero(),
            Error::NotRegistered
        );
        let mut epochs = self.epochs.setter(trading_addr);
        let mut e = epochs.setter(self.cur_epochs.get(trading_addr));
        assert_or!(
            are_we_in_whinging_period(e.campaign_when_called.get(), block_timestamp())?,
            Error::NotInWhingingPeriod
        );
        // We only allow the inconclusive statement to be made in the predict path.
        assert_or!(!preferred_outcome.is_zero(), Error::PreferredOutcomeIsZero);
        assert_or!(
            e.campaign_when_whinged.get().is_zero(),
            Error::AlreadyWhinged
        );
        fusdc_call::take_from_sender(BOND_FOR_WHINGE)?;
        e.campaign_who_whinged.set(bond_recipient);
        e.campaign_whinger_preferred_winner.set(preferred_outcome);
        Ok(())
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
