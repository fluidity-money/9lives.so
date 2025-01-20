use stylus_sdk::alloy_primitives::{aliases::*, *};

use crate::{
    error::*,
    fusdc_call, trading_call,
    utils::{block_timestamp, msg_sender},
};

// This exports user_entrypoint, which we need to have the entrypoint code.
pub use crate::storage_beauty_contest::*;

#[cfg(target_arch = "wasm32")]
use alloc::vec::Vec;

#[cfg_attr(feature = "contract-beauty-contest", stylus_sdk::prelude::public)]
impl StorageBeautyContest {
    // Resolve a market by getting the amounts of the outcomes specified,
    // then if the minimum amount of shares sums up to be more than the
    // amount remaining, then we proceed with picking a winner.
    pub fn resolve(
        &self,
        trading_addr: Address,
        mut outcome_ids: Vec<FixedBytes<8>>,
        fee_recipient: Address,
    ) -> R<U256> {
        let global_shares = trading_call::global_shares(trading_addr)?;
        // Sanity check that this isn't the AMM (currently), and that it's set up.
        assert_or!(!global_shares.is_zero(), Error::TradingEmpty);
        assert_or!(!outcome_ids.is_empty(), Error::MustContainOutcomes);
        assert_or!(
            trading_call::time_ending(trading_addr)? < block_timestamp(),
            Error::NotPastDeadline
        );
        let fee_recipient = if fee_recipient.is_zero() {
            msg_sender()
        } else {
            fee_recipient
        };
        outcome_ids.sort();
        outcome_ids.dedup();
        let outcome_fst = outcome_ids[0];
        let (count_shares, _, min_shares, winning_outcome) = outcome_ids.into_iter().try_fold(
            (U256::ZERO, U256::ZERO, U256::ZERO, outcome_fst),
            |(count_shares, max_shares, min_shares, winning_outcome), outcome_id| {
                let (shares, _, _, winner) = trading_call::details(trading_addr, outcome_id)?;
                assert_or!(!winner.is_zero(), Error::WinnerAlreadyDeclared);
                let is_greater = shares > max_shares;
                Ok((
                    count_shares + shares,
                    if is_greater { shares } else { max_shares },
                    if shares < min_shares {
                        shares
                    } else {
                        min_shares
                    },
                    if is_greater {
                        outcome_id
                    } else {
                        winning_outcome
                    },
                ))
            },
        )?;
        // We need to check that the global shares remaining is less than
        // the minimum that we have. If that's not the case, then they
        // supplied the calldata incorrectly, and we need to revert.
        // This is to ensure that we don't accidentally miss the maximum
        // that a winner supplied.
        assert_or!(
            global_shares - count_shares <= min_shares,
            Error::BeautyContestBadOutcomes
        );
        // Now that we know the winner, we need to decide the outcome.
        let comp = trading_call::decide(trading_addr, winning_outcome)?;
        fusdc_call::transfer(fee_recipient, comp)?;
        Ok(comp)
    }
}
