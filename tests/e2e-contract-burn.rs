#![cfg(all(feature = "testing", not(target_arch = "wasm32")))]

#[allow(unused)]
use {
    lib9lives::{
        error::*, immutables::*, interactions_clear_after, panic_guard, panic_guard_eq,
        should_spend, should_spend_fusdc_contract, should_spend_fusdc_sender, storage_trading::*,
        testing_addrs::IVAN, utils::*,
    },
    stylus_sdk::alloy_primitives::{Address, FixedBytes, U256},
};

use proptest::prelude::*;

proptest! {
    #[test]
    #[cfg(feature = "trading-backend-dpm")]
    fn test_e2e_dpm_should_not_be_able_to_burn(
        amt in strat_tiny_u256(),
        mut c in strat_storage_trading(false)
    ) {
        let outcome_a = c.outcome_list.get(0).unwrap();
        let share_addr = c.share_addr(outcome_a).unwrap();
        interactions_clear_after! {
            IVAN => {
                should_spend!(share_addr, { msg_sender() => amt },
                    Ok(panic_guard_eq!(
                        c.burn_permit_7045_A_604(
                            outcome_a,
                            amt,
                            msg_sender(),
                            U256::ZERO,
                            0,
                            FixedBytes::<32>::ZERO,
                            FixedBytes::<32>::ZERO
                        ),
                        Error::AMMOnly
                    ))
                );
            },
        };
    }

    #[test]
    #[cfg(feature = "trading-backend-amm")]
    fn test_e2e_amm_burning(
        oracle_addr in strat_address_not_empty(),
        fee_recipient_addr in strat_address_not_empty(),
        share_impl_addr in strat_address_not_empty(),
        should_buffer_time in any::<bool>(),
        fusdc_mint_amt in strat_tiny_u256(),
        mut c in strat_storage_trading(false)
    ) {
        let outcome_ids = (0..c.outcome_list.len())
            .map(|x| c.outcome_list.get(x).unwrap())
            .collect::<Vec<_>>();
        // Simply shock the function to see how it behaves when someone goes to
        // randomly burn part of the supply.
        c.created.set(false);
        c.is_shutdown.set(false);
        let outcome_a = outcome_ids[0];
        // This should set up the internal accounting correctly for share balances.
        c.ctor(
            outcome_ids.clone(),
            oracle_addr,
            block_timestamp(),
            block_timestamp() + 100,
            fee_recipient_addr,
            share_impl_addr,
            should_buffer_time
        )
            .unwrap();
        let share_addr = c.share_addr(outcome_a).unwrap();
        test_block_timestamp_add_time(20);
        // Assuming that in order, our outcome id won't matter.
        interactions_clear_after! {
            IVAN => {
                let share_amt = should_spend_fusdc_sender!(
                    fusdc_mint_amt,
                    c.mint_permit_E_90275_A_B(
                        outcome_a,
                        fusdc_mint_amt,
                        msg_sender(),
                        U256::ZERO,
                        0,
                        FixedBytes::<32>::ZERO,
                        FixedBytes::<32>::ZERO
                    )
                );
                assert_eq!(
                    fusdc_mint_amt,
                    should_spend!(share_addr, { msg_sender() => share_amt },
                        Ok(should_spend_fusdc_contract!(
                            fusdc_mint_amt,
                            c.burn_permit_7045_A_604(
                                outcome_a,
                                fusdc_mint_amt,
                                IVAN,
                                U256::ZERO,
                                0,
                                FixedBytes::<32>::ZERO,
                                FixedBytes::<32>::ZERO
                            )
                        ))
                    )
                );
            }
        }
    }
}
