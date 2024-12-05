use stylus_sdk::{alloy_primitives::*, contract,};

#[cfg(target_arch = "wasm32")]
use alloc::vec::Vec;

use crate::{
    erc20_call, error::*, fees::*, fusdc_call, immutables::*, lockup_call,
    timing_opt_infra_market::*, trading_call, utils::block_timestamp,
};

pub use crate::storage_opt_infra_market::*;

#[cfg_attr(feature = "contract-infra-market-sweep", stylus_sdk::prelude::public)]
impl StorageOptimisticInfraMarket {
    /// Checks if the time is over the time for this infra campaign to expire
    /// (the claiming stage). If so, then we tally up the amounts invested,
    /// and we determine who the winner was, if we haven't already. We either
    /// return or slash the bond of the user who called the call function. We
    /// check a flag to know if this already took place. Following that, we
    /// target a specific user that we want to collect funds from. The caller
    /// of this function, if they're the first user to call this, receives a
    /// small amount allocated by the creator of the prediction campaign. The
    /// caller to sweep provides the outcome identifiers, which are used to
    /// reconstruct the amounts that were invested in each outcome. If the
    /// user passes these incorrectly, this code reverts. If they don't pass
    /// an address of a victim to take funds from, this code assumes they're
    /// not scalping funds from users, and just sends them the incentive money
    /// that the creator supplied. There are three stages to this interaction:
    /// the first stage where the campaign has expired (after 3 days), and
    /// normal sweeping behaviour is possible. During this stage, it's
    /// possible to claim funds from the bad bettors in this campaign if your
    /// share of the winning outcome is greater than their share in the losing
    /// outcome. After 5 days, the "anything goes" period begins, where it's
    /// possible for anyone to claim the entire amounts that a bad bettor made
    /// regardless if you beat them on the share held by them relative to
    /// yours, provided that you participated in this campaign. After 7 days,
    /// it's not possible to sweep bad outcomes any more. There is a check
    /// inside this code that prevents a user's position from being taken from
    /// them if their recorded share in this pool is either 0, or that their
    /// recorded ARB allocated to this outcome is more than their reported
    /// current amount of ARB in the rest of the lockup contract. Once they
    /// take the amount from a victim, their global voting power is reduced by
    /// the amount that the victim had. This way, they can continue to slash
    /// users, and presumably, the recipient was identified as having correctly
    /// bet already, so it's safe for the check that their position bet on the
    /// correct outcome to start to become odd. This way, the system should be
    /// tolerable of bad behaviour and unusal interaction, say, if a user gets
    /// slashed across multiple pools at once. A bad edge case scenario in
    /// this slashing situation is funds are stuck in the other contract, as a
    /// victim's tracked vested ARB is less than what's locked in the pool.
    /// That situation is tolerable, as that amount would go to governance
    /// potentially, after being taken by another user. Since it's a good idea
    /// for users to call this on behalf of other users based on their financial
    /// position, then we reward msg_sender with a small fee of what the
    /// fee recipient would receive in the form of a fee.
    /// Returns the caller's yield taken (for acting as an agent for another user,
    /// and for calling sweep), and the amount the fee recipient would get.
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
            !self.campaign_call_begins.get(trading_addr).is_zero(),
            Error::NotRegistered
        );
        assert_or!(
            are_we_in_sweeping_period(
                self.campaign_when_whinged.get(trading_addr),
                block_timestamp()
            )?,
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
                // At this point, if we're not Some with the winner choice here,
                // then we need to default to what the caller provided during the calling
                // stage. This could happen if the liquidity is even across every outcome.
                // If that's the case, we're still going to slash people who bet poorly later.
                // The assumption is that the whinging bond is the differentiating amount
                // in this extreme scenario.
                let voting_power_winner = match current_voting_power_winner_id {
                    Some(v) => v,
                    None => {
                        let campaign_called = self.campaign_what_called.get(trading_addr);
                        // In a REALLY extreme scenario, what could happen is that
                        // there was a challenge to the default outcome but no-one called it
                        // so there was no period of whinging. In this extreme circumstance,
                        // we default to the whinger's preferred outcome, since they posted
                        // a bond that would presumably tip the scales in their favour.
                        if campaign_called.is_zero() {
                            self.campaign_whinger_preferred_winner.get(trading_addr)
                        } else {
                            campaign_called
                        }
                    }
                };
                self.campaign_winner
                    .setter(trading_addr)
                    .set(voting_power_winner);
                // If the whinger was correct, we owe them their bond.
                if voting_power_winner == self.campaign_whinger_preferred_winner.get(trading_addr) {
                    fusdc_call::transfer(
                        self.campaign_who_whinged.get(trading_addr),
                        BOND_FOR_WHINGE,
                    )?;
                }
                // Looks like we owe the fee recipient some money.
                fusdc_call::transfer(fee_recipient_addr, INCENTIVE_AMT_SWEEP)?;
                caller_yield_taken += INCENTIVE_AMT_SWEEP;
                // At this point we call the campaign that this is
                // connected to let them know that there was a winner. Hopefully
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
            return Ok((caller_yield_taken, U256::ZERO));
        }
        // We check if the victim's vested power is 0. If it is, then we assume
        // that someone already claimed this victim's position! Or, they never bet
        // wrong, and someone is trying to abuse this system.
        let victim_global_vested_power = self
            .user_global_vested_power
            .getter(trading_addr)
            .get(victim_addr);
        if victim_global_vested_power.is_zero() {
            return Ok((caller_yield_taken, on_behalf_of_yield_taken));
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
            return Ok((caller_yield_taken, on_behalf_of_yield_taken));
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
        // recipient can claim this amount by looking at their power.
        let caller_winning_power = self
            .user_campaign_vested_power
            .getter(trading_addr)
            .getter(campaign_winner)
            .get(on_behalf_of_addr);
        // If the amount of time that's exceeded is 5 days, then we're
        // inside a "ANYTHING GOES" period where someone could claim the
        // victim's entire position without beating them on the
        // percentage of the share that's held.
        let are_we_anything_goes_period = are_we_in_anything_goes_period(
            self.campaign_when_whinged.get(trading_addr),
            block_timestamp(),
        )?;
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
            .setter(on_behalf_of_addr)
            .set(caller_winning_power - diluted_victim_power);
        // Transfer the victim's entire staked ARB position to the
        // caller. Make sure noone can drain from this user in this
        // contract again! We shouldn't need to worry about overflow here due
        // to the amount being sent being quite low and passing other checks.
        let confiscated =
            lockup_call::confiscate(self.lockup_addr.get(), victim_addr, contract::address())?;
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
}
