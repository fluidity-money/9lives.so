use stylus_sdk::alloy_primitives::*;

use crate::{
    error::*,
    immutables::*,
    proxy,
    utils::{block_timestamp, contract_address, msg_sender},
};

use alloc::vec::Vec;

// This exports user_entrypoint, which we need to have the entrypoint code.
pub use crate::storage_trading::*;

#[cfg(not(feature = "trading-backend-dpm"))]
use crate::fusdc_call;

// Arguments for the ctor function. In a tuple form for Solidity
// calldata, and for a Default trait impl later.
pub type CtorArgs = (
    Vec<FixedBytes<8>>, // [0] Outcomes
    Address,            // [1] Oracle
    u64,                // [2] Time start
    u64,                // [3] Time ending
    Address,            // [4] Fee recipient
    Address,            // [5] Share implementation
    bool,               // [6] Should buffer time?
    u64,                // [7] Fee for creator
    u64,                // [8] Fee for LP
    u64,                // [9] Fee for minter
    u64,                // [10] Fee for referrer
);

#[cfg_attr(feature = "contract-trading-extras", stylus_sdk::prelude::public)]
impl StorageTrading {
    // Seeds the pool with the first outcome. Assumes msg.sender is
    // the factory. Seeder is the address to take the money from. It
    // should have the approval done beforehand with its own
    // estimation of the address based on the CREATE2 process.
    // Does not prevent a user from submitting the same outcome twice!
    // Unfortunately, the signature is like this because Solidity runs
    // out of stack space, and we need to pass in explicitly a struct
    // here to circumvent that, which alters the signature.
    #[allow(clippy::too_many_arguments)]
    pub fn ctor(&mut self, a: CtorArgs) -> R<()> {
        self.internal_ctor(a.0, a.1, a.2, a.3, a.4, a.5, a.6, a.7, a.8, a.9, a.10)
    }

    pub fn add_liquidity_permit(
        &mut self,
        _amount: U256,
        _recipient: Address,
        _deadline: U256,
        _v: u8,
        _r: FixedBytes<32>,
        _s: FixedBytes<32>,
    ) -> R<(U256, Vec<(FixedBytes<8>, U256)>)> {
        #[cfg(feature = "trading-backend-dpm")]
        unimplemented!();
        #[cfg(not(feature = "trading-backend-dpm"))]
        return {
            self.require_not_done_predicting()?;
            if _deadline.is_zero() {
                c!(fusdc_call::take_from_sender(_amount));
            } else {
                c!(fusdc_call::take_from_sender_permit(
                    _amount, _deadline, _v, _r, _s
                ))
            }
            self.internal_amm_add_liquidity(_amount, _recipient)
        };
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
            self.winner.get(),
        ));
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
        return Ok(self.amm_liquidity.get());
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

/// Default for CtorArgs, which is useful for defining simple tests on the
/// ctor function behaving correctly with certain inputs.
#[cfg(test)]
fn default_ctor_args() -> CtorArgs {
    (
        vec![],
        Address::ZERO,
        0,
        0,
        Address::ZERO,
        Address::ZERO,
        false,
        0,
        0,
        0,
        0,
    )
}

#[cfg(not(target_arch = "wasm32"))]
#[test]
fn test_cant_recreate() {
    use stylus_sdk::alloy_primitives::fixed_bytes;
    crate::host::with_contract::<_, StorageTrading, _>(|c| {
        c.ctor((
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
            0,
        ))
        .unwrap();
        assert_eq!(
            Error::AlreadyConstructed,
            c.ctor((
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
                0,
            ))
            .unwrap_err()
        )
    });
}

// Property testing that takes advantage of the tuple type to simplify
// doing setup.
#[cfg(all(test, not(target_arch = "wasm32")))]
mod proptesting {
    use super::*;

    use crate::{
        strat_storage_trading,
        utils::{strat_fixed_bytes, strat_address_not_empty, strat_tiny_u256},
    };

    use stylus_sdk::alloy_primitives::U256;

    use proptest::prelude::*;

    proptest! {
        #[test]
        fn test_fee_addition_cant_be_excessive(
            outcomes in proptest::collection::vec(strat_fixed_bytes::<8>(), 2),
            share_impl in any::<Address>(),
            fee_for_creator in 100u64..,
            fee_for_lp in 100u64..,
            fee_for_referrer in 100u64..,
            mut c in strat_storage_trading(false)
        ) {
             c.created.set(false);
            let mut a = default_ctor_args();
            a.5 = share_impl;
            a.3 = 100;
            a.0 = outcomes;
            // Let's hope that's enough to be passing!
            a.7 = fee_for_creator;
            panic_guard(||
                assert_eq!(Error::ExcessiveFee, c.ctor(a.clone()).unwrap_err())
            );
            a.7 = 0;
            a.8= fee_for_lp;
            panic_guard(||
                assert_eq!(Error::ExcessiveFee, c.ctor(a.clone()).unwrap_err())
            );
            a.8 = 0;
            a.10 = fee_for_referrer;
            panic_guard(||
                assert_eq!(Error::ExcessiveFee, c.ctor(a.clone()).unwrap_err())
            );
            a.10 = 0;
            // Make sure that we can actually construct under normal circumstances!
            c.ctor(a).unwrap()
        }
    }
}
