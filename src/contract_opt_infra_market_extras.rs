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
        emergency_council: Address,
        lockup_addr: Address,
        locked_arb_token_addr: Address,
        factory_addr: Address,
    ) -> R<()> {
        assert_or!(!self.created.get(), Error::AlreadyConstructed);
        self.created.set(true);
        self.enabled.set(true);
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
        default_winner: FixedBytes<8>,
    ) -> R<U256> {
        assert_or!(self.enabled.get(), Error::NotEnabled);
        assert_or!(
            self.campaign_call_begins.get(trading_addr).is_zero(),
            Error::AlreadyRegistered
        );
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
        self.campaign_default_winner
            .setter(trading_addr)
            .set(default_winner);
        // Take the incentive amount base amount to give to the user who
        // calls sweep for the first time with the correct calldata.
        fusdc_call::take_from_funder_to(incentive_sender, contract::address(), INCENTIVE_AMT_BASE)?;
        evm::log(events::MarketCreated2 {
            incentiveSender: incentive_sender,
            tradingAddr: trading_addr,
            defaultWinner: default_winner,
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
    pub fn call(
        &mut self,
        trading_addr: Address,
        winner: FixedBytes<8>,
        incentive_recipient: Address,
    ) -> R<()> {
        assert_or!(
            !self.campaign_call_begins.get(trading_addr).is_zero(),
            Error::NotRegistered
        );
        assert_or!(
            are_we_in_calling_period(
                self.campaign_call_begins.get(trading_addr),
                block_timestamp()
            )?,
            Error::NotInsideCallingPeriod
        );
        assert_or!(
            self.campaign_who_called.get(trading_addr).is_zero(),
            Error::CampaignAlreadyCalled
        );
        let incentive_recipient = if incentive_recipient.is_zero() {
            msg_sender()
        } else {
            incentive_recipient
        };
        self.campaign_when_called
            .setter(trading_addr)
            .set(U64::from(block_timestamp()));
        self.campaign_who_called
            .setter(trading_addr)
            .set(incentive_recipient);
        self.campaign_what_called.setter(trading_addr).set(winner);
        // TODO: event here
        Ok(())
    }

    pub fn winner(&self, trading: Address) -> R<FixedBytes<8>> {
        Ok(self.campaign_winner.get(trading))
    }

    pub fn market_power_vested(&self, trading: Address, outcome: FixedBytes<8>) -> R<U256> {
        Ok(self.campaign_vested_power.getter(trading).get(outcome))
    }

    pub fn global_power_vested(&self, trading: Address) -> R<U256> {
        Ok(self.campaign_global_power_vested.get(trading))
    }

    pub fn user_power_vested(&self, trading: Address, spender: Address) -> R<U256> {
        Ok(self.user_global_vested_power.getter(trading).get(spender))
    }

    /// This should be called by someone after the whinging period has ended, but only if we're
    /// in a state where no-one has whinged. This will reward the caller their incentive amount.
    /// This will set the campaign_winner storage field to what was declared by the caller.
    pub fn close(&mut self, trading_addr: Address, fee_recipient: Address) -> R<U256> {
        assert_or!(
            !self.campaign_call_begins.get(trading_addr).is_zero(),
            Error::NotRegistered
        );
        assert_or!(
            !are_we_in_calling_period(
                self.campaign_when_called.get(trading_addr),
                block_timestamp()
            )?,
            Error::InCallingPeriod
        );
        assert_or!(
            self.campaign_when_whinged.get(trading_addr).is_zero(),
            Error::SomeoneWhinged
        );
        // This should be enough to see if someone already used this.
        assert_or!(
            self.campaign_winner.get(trading_addr).is_zero(),
            Error::WinnerAlreadyDeclared
        );
        let fee_recipient = if fee_recipient.is_zero() {
            msg_sender()
        } else {
            fee_recipient
        };
        // Send the caller of this function their incentive for doing so.
        fusdc_call::transfer(fee_recipient, INCENTIVE_AMT_CLOSE)?;
        // Send the user who originally called this outcome their
        // incentive for doing so, and for being right.
        let campaign_who_called = self.campaign_who_called.get(trading_addr);
        // We make sure to send the fee for calling to either the user who
        // called it, or this caller.
        let fees_earned = INCENTIVE_AMT_CLOSE
            + if campaign_who_called.is_zero() {
                INCENTIVE_AMT_CALL
            } else {
                U256::ZERO
            };
        fusdc_call::transfer(
            if campaign_who_called.is_zero() {
                fee_recipient
            } else {
                campaign_who_called
            },
            INCENTIVE_AMT_CALL,
        )?;
        // There may be an extreme situation where no-one declares the
        // winner. If that's the case, then we fall back on the "default"
        // outcome.
        let campaign_what_called = self.campaign_what_called.get(trading_addr);
        // We set the winner, and if for some reason, the winner wasn't
        // set by anyone during the call stage, then we set it to the
        // default winner that was provided by the user who did the
        // setup.
        let campaign_winner = if campaign_what_called.is_zero() {
            self.campaign_default_winner.get(trading_addr)
        } else {
            campaign_what_called
        };
        self.campaign_winner
            .setter(trading_addr)
            .set(campaign_winner);
        evm::log(events::InfraMarketClosed {
            incentiveRecipient: fee_recipient,
            tradingAddr: trading_addr,
            winner: campaign_winner,
        });
        // It should be okay to just call this contract since the factory
        // will guarantee that there's an associated contract here.
        trading_call::decide(trading_addr, campaign_winner)?;
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
            !self.campaign_call_begins.get(trading_addr).is_zero(),
            Error::NotRegistered
        );
        assert_or!(
            are_we_in_whinging_period(
                self.campaign_when_called.get(trading_addr),
                block_timestamp()
            )?,
            Error::NotInWhingingPeriod
        );
        assert_or!(!preferred_outcome.is_zero(), Error::PreferredOutcomeIsZero);
        assert_or!(
            self.campaign_when_whinged.get(trading_addr).is_zero(),
            Error::AlreadyWhinged
        );
        fusdc_call::take_from_sender(BOND_FOR_WHINGE)?;
        self.campaign_who_whinged
            .setter(trading_addr)
            .set(bond_recipient);
        self.campaign_whinger_preferred_winner
            .setter(trading_addr)
            .set(preferred_outcome);
        Ok(())
    }
}
