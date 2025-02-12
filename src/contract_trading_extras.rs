use stylus_sdk::{alloy_primitives::*, evm};

use crate::{
    error::*,
    events, factory_call,
    immutables::*,
    proxy,
    utils::{block_timestamp, contract_address, msg_sender},
};

#[cfg(target_arch = "wasm32")]
use alloc::vec::Vec;

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
        should_buffer_time: bool,
    ) -> R<()> {
        assert_or!(!self.created.get(), Error::AlreadyConstructed);
        // Make sure that the user hasn't given us any zero values, or the end
        // date isn't in the past, in places that don't make sense!
        assert_or!(
            time_ending >= block_timestamp() && !share_impl.is_zero(),
            Error::BadTradingCtor
        );
        // We assume that the caller already supplied the liquidity to
        // us, and we set them as the factory.
        let seed_liquidity = U256::from(outcomes.len()) * FUSDC_DECIMALS_EXP;
        self.global_invested.set(seed_liquidity);
        self.seed_invested.set(seed_liquidity);
        let outcomes_len: i64 = outcomes.len().try_into().unwrap();
        self.global_shares
            .set(U256::from(outcomes_len) * SHARE_DECIMALS_EXP);
        // Start to go through each outcome, and seed it with its initial amount.
        // And set each slot in the storage with the outcome id for Longtail
        // later.
        unsafe {
            // We don't need to reset this, but it's useful for testing, and
            // is presumably pretty cheap.
            self.outcome_list.set_len(0);
        }
        #[cfg(feature = "trading-backend-amm")]
        let outcome_len = outcomes.len();
        for outcome_id in outcomes {
            // This isn't a precaution that we actually need, but there may be weird
            // behaviour with this being possible (ie, payoff before the end date).
            assert_or!(!outcome_id.is_zero(), Error::OutcomeIsZero);
            // We always set this to 1 now.
            self.outcome_invested
                .setter(outcome_id)
                .set(SHARE_DECIMALS_EXP);
            #[cfg(feature = "trading-backend-dpm")]
            self.outcome_shares
                .setter(outcome_id)
                .set(U256::from(1) * SHARE_DECIMALS_EXP);
            #[cfg(feature = "trading-backend-amm")]
            self.outcome_shares
                .setter(outcome_id)
                .set(U256::from(outcome_len) * SHARE_DECIMALS_EXP);
            self.outcome_list.push(outcome_id);
        }
        // We assume that the sender is the factory.
        self.created.set(true);
        self.factory_addr.set(msg_sender());
        self.share_impl.set(share_impl);
        // If the fee recipient is zero, then we set it to the DAO address.
        self.fee_recipient.set(if fee_recipient.is_zero() {
            DAO_ADDR
        } else {
            fee_recipient
        });
        self.time_start.set(U64::from(time_start));
        self.time_ending.set(U64::from(time_ending));
        self.oracle.set(oracle);
        self.should_buffer_time.set(should_buffer_time);
        Ok(())
    }

    pub fn is_shutdown(&self) -> R<bool> {
        Ok(self.is_shutdown.get())
    }

    pub fn time_start(&self) -> R<u64> {
        Ok(u64::from_le_bytes(self.time_start.get().to_le_bytes()))
    }

    pub fn time_ending(&self) -> R<u64> {
        Ok(u64::from_le_bytes(self.time_ending.get().to_le_bytes()))
    }

    pub fn oracle(&self) -> R<Address> {
        Ok(self.oracle.get())
    }

    pub fn shutdown(&mut self) -> R<U256> {
        assert_or!(
            u64::from_be_bytes(self.time_ending.get().to_be_bytes()) < block_timestamp(),
            Error::NotPastDeadline
        );
        self.internal_shutdown()
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
        // We call shutdown in the event this wasn't called in the past.
        if !self.is_shutdown.get() {
            self.internal_shutdown()?;
        }
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

    #[mutants::skip]
    pub fn ended(&self) -> R<bool> {
        Ok(!self.when_decided.is_zero())
    }

    #[mutants::skip]
    pub fn invested(&self) -> R<U256> {
        Ok(self.global_invested.get())
    }

    pub fn share_addr(&self, outcome: FixedBytes<8>) -> R<Address> {
        Ok(proxy::get_share_addr(
            self.factory_addr.get(),
            contract_address(),
            self.share_impl.get(),
            outcome,
        ))
    }
}

impl StorageTrading {
    fn internal_shutdown(&mut self) -> R<U256> {
        // Notify Longtail to pause trading on every outcome pool.
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
}

#[cfg(not(target_arch = "wasm32"))]
#[test]
fn test_cant_recreate() {
    use stylus_sdk::alloy_primitives::fixed_bytes;
    crate::host::with_contract::<_, StorageTrading, _>(|c| {
        c.ctor(
            vec![
                fixed_bytes!("0541d76af67ad076"),
                fixed_bytes!("0541d76af67ad077"),
            ],
            Address::ZERO,
            0,
            u64::MAX,
            Address::ZERO,
            crate::testing_addrs::SHARE,
            false,
        )
        .unwrap();
        assert_eq!(
            Error::AlreadyConstructed,
            c.ctor(
                vec![
                    fixed_bytes!("0541d76af67ad076"),
                    fixed_bytes!("0541d76af67ad077"),
                ],
                Address::ZERO,
                0,
                u64::MAX,
                Address::ZERO,
                Address::ZERO,
                false,
            )
            .unwrap_err()
        )
    });
}
