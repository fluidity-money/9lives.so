use stylus_sdk::{alloy_primitives::*, contract, evm};

#[cfg(target_arch = "wasm32")]
use alloc::vec::Vec;

use crate::{
    error::*, events, factory_call, immutables::*, proxy, utils::block_timestamp, utils::msg_sender,
};

// This exports user_entrypoint, which we need to have the entrypoint code.
pub use crate::storage_trading::*;

#[cfg_attr(feature = "contract-trading-extras", stylus_sdk::prelude::public)]
impl StorageTrading {
    // Seeds the pool with the first outcome. Assumes msg.sender is
    // the factory. Seeder is the address to take the money from. It
    // should have the approval done beforehand with its own
    // estimation of the address based on the CREATE2 process.
    // Does not prevent a user from submitting the same outcome twice!
    #[allow(clippy::too_many_arguments)]
    pub fn ctor(
        &mut self,
        outcomes: Vec<FixedBytes<8>>,
        oracle: Address,
        time_start: u64,
        time_ending: u64,
        fee_recipient: Address,
        share_impl: Address,
        should_buffer_time: bool
    ) -> R<()> {
        assert_or!(!self.created.get(), Error::AlreadyConstructed);
        // We assume that the caller already supplied the liquidity to
        // us, and we set them as the factory.
        let seed_liquidity = U256::from(outcomes.len()) * FUSDC_DECIMALS_EXP;
        self.global_invested.set(seed_liquidity);
        self.seed_invested.set(seed_liquidity);
        let outcomes_len: i64 = outcomes.len().try_into().unwrap();
        self.global_shares
            .set(U256::from(outcomes_len) * SHARE_DECIMALS_EXP);
        // Start to go through each outcome, and seed it with its initial amount. And
        // set each slot in the storage with the outcome id for Longtail later.
        for outcome_id in outcomes {
            // We always set this to 1 now.
            self.outcome_invested
                .setter(outcome_id)
                .set(SHARE_DECIMALS_EXP);
            self.outcome_shares
                .setter(outcome_id)
                .set(U256::from(1) * SHARE_DECIMALS_EXP);
            self.outcome_list.push(outcome_id);
        }
        // We assume that the sender is the factory.
        self.factory_addr.set(msg_sender());
        self.share_impl.set(share_impl);
        self.fee_recipient.set(fee_recipient);
        self.time_start.set(U64::from(time_start));
        self.time_ending.set(U64::from(time_ending));
        self.oracle.set(oracle);
        self.should_buffer_time.set(should_buffer_time);
        Ok(())
    }

    pub fn shutdown(&mut self) -> R<U256> {
        // Notify Longtail to pause trading on every outcome pool.
        // TODO, send a "thank you" amount to the caller of this function
        // when it's called for the first time. This should be called by anyone
        // after the date of this closing.
        assert_or!(
            u64::from_be_bytes(self.time_ending.get().to_be_bytes()) < block_timestamp(),
            Error::NotPastDeadline
        );
        assert_or!(!self.is_shutdown.get(), Error::IsShutdown);
        factory_call::disable_shares(
            self.factory_addr.get(),
            &(0..self.outcome_list.len())
                .map(|i| self.outcome_list.get(i).unwrap())
                .collect::<Vec<_>>(),
        )?;
        self.is_shutdown.set(true);
        Ok(U256::ZERO)
    }

    pub fn decide(&mut self, outcome: FixedBytes<8>) -> R<U256> {
        let oracle_addr = self.oracle.get();
        assert_or!(msg_sender() == oracle_addr, Error::NotOracle);
        assert_or!(self.when_decided.get().is_zero(), Error::NotTradingContract);
        // Set the outcome that's winning as the winner!
        self.winner.set(outcome);
        self.when_decided.set(U64::from(block_timestamp()));
        evm::log(events::OutcomeDecided {
            identifier: outcome,
            oracle: oracle_addr,
        });
        Ok(U256::ZERO)
    }

    pub fn details(&self, outcome_id: FixedBytes<8>) -> R<(U256, U256, U256, FixedBytes<8>)> {
        Ok((
            self.outcome_shares.get(outcome_id),
            self.outcome_invested.get(outcome_id),
            self.global_invested.get(),
            self.winner.get(),
        ))
    }

    pub fn global_shares(&self) -> R<U256> {
        Ok(self.global_shares.get())
    }

    pub fn is_dpm(&self) -> R<bool> {
        #[cfg(feature = "trading-backend-dpm")]
        {
            Ok(true)
        }
        #[cfg(not(feature = "trading-backend-dpm"))]
        {
            Ok(false)
        }
    }

    pub fn ended(&self) -> R<bool> {
        Ok(!self.when_decided.is_zero())
    }

    pub fn invested(&self) -> R<U256> {
        Ok(self.global_invested.get())
    }

    pub fn share_addr(&self, outcome: FixedBytes<8>) -> R<Address> {
        Ok(proxy::get_share_addr(
            self.factory_addr.get(),
            contract::address(),
            self.share_impl.get(),
            outcome,
        ))
    }
}
