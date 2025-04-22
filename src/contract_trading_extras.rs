use stylus_sdk::alloy_primitives::*;

use crate::{
    error::*,
    immutables::*,
    proxy,
    utils::{block_timestamp, contract_address, msg_sender},
    fusdc_call
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
        assert_or!(!self.created.get(), Error::AlreadyConstructed);
        // Make sure that the user hasn't given us any zero values, or the end
        // date isn't in the past, in places that don't make sense!
        assert_or!(
            time_ending >= block_timestamp() && !share_impl.is_zero() && time_ending > time_start,
            Error::BadTradingCtor
        );
        // We don't allow the fees to exceed 10% (100).
        assert_or!(
            fee_creator < 100 && fee_minter < 100 && fee_lp < 100,
            Error::ExcessiveFee
        );
        unsafe {
            // We don't need to reset this, but it's useful for testing, and
            // is presumably pretty cheap.
            self.outcome_list.set_len(0);
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
        self.fee_creator.set(U256::from(fee_creator));
        self.fee_minter.set(U256::from(fee_minter));
        self.fee_lp.set(U256::from(fee_lp));
        #[cfg(feature = "trading-backend-dpm")]
        return self.internal_dpm_ctor(outcomes);
        #[cfg(not(feature = "trading-backend-dpm"))]
        return self.internal_amm_ctor(outcomes);
    }

    pub fn add_liquidity_permit(
        &mut self,
        amount: U256,
        recipient: Address,
        deadline: U256,
        v: u8,
        r: FixedBytes<32>,
        s: FixedBytes<32>,
    ) -> R<(U256, Vec<(FixedBytes<8>, U256)>)> {
        self.require_not_done_predicting()?;
        if deadline.is_zero() {
            c!(fusdc_call::take_from_sender(amount));
        } else {
            c!(fusdc_call::take_from_sender_permit(
                amount, deadline, v, r, s
            ))
        }
        self.internal_amm_add_liquidity(amount, recipient)
    }

    pub fn remove_liquidity(
        &mut self,
        amount_liq: U256,
        recipient: Address,
    ) -> R<(U256, Vec<(FixedBytes<8>, U256)>)> {
        self.require_not_done_predicting()?;
        assert_or!(!amount_liq.is_zero(), Error::ZeroShares);
        assert_or!(
            self.amm_user_liquidity_shares.get(msg_sender()) >= amount_liq,
            Error::NotEnoughLiquidity
        );
        let (fusdc_amt, shares_received) =
            self.internal_amm_remove_liquidity(amount_liq, recipient)?;
        fusdc_call::transfer(recipient, fusdc_amt)?;
        Ok((fusdc_amt, shares_received))
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
        self.internal_decide(outcome)
    }

    pub fn details(&self, outcome_id: FixedBytes<8>) -> R<(U256, U256, U256, FixedBytes<8>)> {
        #[cfg(feature = "trading-backend-dpm")]
        return Ok((
            self.dpm_outcome_shares.get(outcome_id),
            self.dpm_outcome_invested.get(outcome_id),
            self.dpm_global_invested.get(),
            self.winner.get(),
        ));
        #[cfg(not(feature = "trading-backend-dpm"))]
        return Ok((
            self.amm_shares.get(outcome_id),
            self.amm_total_shares.get(outcome_id),
            self.amm_liquidity.get(),
            self.winner.get()
        ))
    }

    pub fn escape(&mut self) -> R<()> {
        let oracle_addr = self.oracle.get();
        assert_or!(msg_sender() == oracle_addr, Error::NotOracle);
        self.is_escaped.set(true);
        Ok(())
    }

    pub fn global_shares(&self) -> R<U256> {
        #[cfg(feature = "trading-backend-dpm")]
        return Ok(self.dpm_global_shares.get());
        #[cfg(not(feature = "trading-backend-dpm"))]
        unimplemented!()
    }

    pub fn is_dpm(&self) -> bool {
        #[cfg(feature = "trading-backend-dpm")]
        return true;
        #[cfg(not(feature = "trading-backend-dpm"))]
        return false;
    }

    #[mutants::skip]
    pub fn ended(&self) -> R<bool> {
        Ok(!self.when_decided.is_zero())
    }

    #[mutants::skip]
    pub fn invested(&self) -> R<U256> {
        #[cfg(feature = "trading-backend-dpm")]
        return Ok(self.dpm_global_invested.get());
        #[cfg(not(feature = "trading-backend-dpm"))]
        return Ok(self.amm_liquidity.get())
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
