use stylus_sdk::{alloy_primitives::*, };

use crate::{
    error::*,
    immutables::*,
    proxy,
    utils::{block_timestamp, contract_address, msg_sender},
};

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
        fee_creator: u64,
        fee_lp: u64,
        fee_minter: u64,
    ) -> R<()> {
        self.internal_dpm_ctor(
            outcomes,
            oracle,
            time_start,
            time_ending,
            fee_recipient,
            share_impl,
            should_buffer_time,
            fee_creator,
            fee_lp,
            fee_minter,
        )
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

    pub fn fusdc_addr(&self) -> R<Address> {
        Ok(FUSDC_ADDR)
    }

    pub fn shutdown(&mut self) -> R<U256> {
        assert_or!(
            u64::from_be_bytes(self.time_ending.get().to_be_bytes()) < block_timestamp(),
            Error::NotPastDeadline
        );
        self.internal_shutdown()
    }

    pub fn decide(&mut self, outcome: FixedBytes<8>) -> R<U256> {
        self.internal_dpm_decide(outcome)
    }

    pub fn details(&self, outcome_id: FixedBytes<8>) -> R<(U256, U256, U256, FixedBytes<8>)> {
        Ok((
            self.outcome_shares.get(outcome_id),
            self.outcome_invested.get(outcome_id),
            self.global_invested.get(),
            self.winner.get(),
        ))
    }

    pub fn escape(&mut self) -> R<()> {
        let oracle_addr = self.oracle.get();
        assert_or!(msg_sender() == oracle_addr, Error::NotOracle);
        self.is_escaped.set(true);
        Ok(())
    }

    pub fn global_shares(&self) -> R<U256> {
        Ok(self.global_shares.get())
    }

    pub fn is_dpm(&self) -> R<bool> {
        Ok(true)
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
            0,
            0,
            0,
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
                0,
                0,
                0,
            )
            .unwrap_err()
        )
    });
}
