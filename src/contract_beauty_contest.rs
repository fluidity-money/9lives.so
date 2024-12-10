
use stylus_sdk::{
    alloy_primitives::{aliases::*, *},
    contract, evm,
};

use crate::{error::*, trading_call};

// This exports user_entrypoint, which we need to have the entrypoint code.
pub use crate::storage_beauty_contest::*;

#[cfg_attr(feature = "contract-beauty-contest", stylus_sdk::prelude::public)]
impl StorageBeautyContest {
Resolve a market by getting the amounts of the outcomes specified, then tracking the global shares
    fn resolve(&self, trading_addr: Address, mut outcome_ids: Vec<Bytes8>) -> R<U256> {
        let global_shares = trading_call::global_shares(trading_addr)?;
        // Sanity check that this isn't the AMM (currently), and that it's set up.
        assert_or!(!global_shares.is_zero(), Error::TradingEmpty);
        assert_or!(outcome_ids.len() > 0, Error::MustContainOutcomes);
        outcome_ids.sort();
        outcome_ids.dedup();
        // The maximum shares that we've seen so far, including the winner.
        let (max_shares, current_winner) = outcome_ids.map(|outcome_id| {

        });
    }
}
