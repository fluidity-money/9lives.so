// Factory creates the Trading contracts with a proxy, and deploys the
// proxies to the ERC20 assets.

use stylus_sdk::{
    alloy_primitives::{aliases::*, *},
    evm,
};

#[cfg(target_arch = "wasm32")]
use alloc::{string::String, vec::Vec};

#[cfg(feature = "trading-backend-dpm")]
use crate::amm_call;

use crate::{
    error::*, events, fees::*, fusdc_call, immutables::*, infra_market_call, proxy,
    share_call, trading_call, utils::block_timestamp,
};

pub use crate::storage_factory::*;

#[cfg_attr(any(feature = "contract-factory-1", test), stylus_sdk::prelude::public)]
impl StorageFactory {
    // Construct a new Trading construct, taking from the user some outcomes
    // and their day 1 odds. We use these to seed the liquidity but only take
    // as much as the amount that the pool was made for. For now, we take the
    // default winner as the first outcome that was supplied to this function.
    #[allow(non_snake_case, clippy::too_many_arguments)]
    pub fn new_trading_90_C_25562(
        &mut self,
        outcomes: Vec<(FixedBytes<8>, U256, String)>,
        oracle: Address,
        time_start: u64,
        time_ending: u64,
        documentation: FixedBytes<32>,
        fee_recipient: Address,
        fee_creator: u64,
        fee_lp: u64,
        fee_minter: u64,
    ) -> R<Address> {
        assert_or!(!outcomes.is_empty(), Error::MustContainOutcomes);

        let outcome_ids = outcomes.iter().map(|(c, _, _)| *c).collect::<Vec<_>>();

        // Create the trading identifier to derive the outcome addresses from.
        let trading_id =
            proxy::create_identifier(&outcome_ids.iter().map(|c| c.as_slice()).collect::<Vec<_>>());

        // For now, every backend will be the AMM form, until we have Longtail supported.
        let backend_is_dpm = false;
        let backend_type = if backend_is_dpm {
            TradingBackendType::DPM as u8
        } else {
            TradingBackendType::AMM as u8
        };

        // Deploy the contract, and emit a log that it was created.
        let trading_addr = (if backend_is_dpm {
            proxy::deploy_trading(
                self.trading_dpm_extras_impl.get(),
                self.trading_dpm_mint_impl.get(),
                self.trading_dpm_quotes_impl.get(),
                self.trading_dpm_price_impl.get(),
                trading_id,
            )
        } else {
            proxy::deploy_trading(
                self.trading_amm_extras_impl.get(),
                self.trading_amm_mint_impl.get(),
                self.trading_amm_quotes_impl.get(),
                self.trading_amm_price_impl.get(),
                trading_id,
            )
        })
        .map_err(|_| Error::DeployError)?;

        self.trading_owners.setter(trading_addr).set(fee_recipient);
        self.trading_backends
            .setter(trading_addr)
            .set(U8::from(backend_type));
        self.trading_addresses.setter(trading_id).set(trading_addr);

        evm::log(events::NewTrading2 {
            identifier: trading_id,
            addr: trading_addr,
            oracle,
            backend: backend_type,
        });

        // We take the amount that the user has allocated to the outcomes, and
        // send it to the trading contract, which assumes it has the money it's entitled to.

        let seed_liq = U256::from(outcome_ids.len()) * SHARE_DECIMALS_EXP;
        fusdc_call::take_from_sender_to(trading_addr, seed_liq)?;

        // This code is in a weird place, the UX no longer supports doing setup
        // with the infra market, and it always assumes the AMM is in use now. In
        // doing so, the fee accounting internally will always prefer to take no
        // fees. The moderation fee can only be enabled with an upgrade.

        // Take the full amount to use as incentives for calling cranks.
        let mod_fee = if self.should_take_mod_fee.get() {
            INCENTIVE_AMT_MODERATION
        } else {
            U256::ZERO
        };
        fusdc_call::take_from_sender(
            mod_fee + {
                if oracle == self.infra_market.get() {
                    // Make sure to take the amount that we need for the infra market.
                    INCENTIVE_AMT_CALL + INCENTIVE_AMT_CLOSE + INCENTIVE_AMT_DECLARE
                } else {
                    U256::ZERO
                }
            },
        )?;
        if self.should_take_mod_fee.get() {
            // Bump the amount that we need to track as a part of our operation revenue.
            self.dao_claimable
                .set(self.dao_claimable.get() + INCENTIVE_AMT_MODERATION);
        }

        for (outcome_identifier, _sqrt_price, outcome_name) in outcomes.iter() {
            let erc20_identifier =
                proxy::create_identifier(&[trading_addr.as_ref(), outcome_identifier.as_slice()]);
            let erc20_addr = proxy::deploy_erc20(self.share_impl.get(), erc20_identifier)
                .map_err(|_| Error::DeployError)?;

            // Set up the share ERC20 asset, with the description.
            share_call::ctor(erc20_addr, outcome_name.clone(), trading_addr)?;

            // Use the current AMM to create a pool of this share for
            // aftermarket trading. Longtail should revert if the sqrt
            // price is bad. This will not run if the backend is the AMM!
            #[cfg(feature = "trading-backend-dpm")]
            amm_call::enable_pool(amm_call::create_pool(
                erc20_addr,
                *_sqrt_price,
                LONGTAIL_FEE,
            )?)?;

            evm::log(events::OutcomeCreated {
                tradingIdentifier: trading_id,
                erc20Identifier: erc20_identifier,
                erc20Addr: erc20_addr,
            });
        }

        trading_call::ctor(
            trading_addr,
            outcome_ids,
            oracle,
            time_start,
            time_ending,
            fee_recipient,
            self.share_impl.get(),
            false,
            fee_creator,
            fee_lp,
            fee_minter,
        )?;

        // If the infra market wasn't chosen, then we assume that the caller has done
        // some setup work to ensure that this is fine. The caller should be very
        // careful regarding the circumstances of their oracle choice, and it should be
        // explained in the UI if this is the case or not.
        if oracle == self.infra_market.get() {
            let deadline_add_two_weeks = if time_ending < u64::MAX {
                time_ending
                    .checked_add(1209600)
                    .ok_or(Error::CheckedAddOverflow)?
            } else {
                time_ending
            };
            infra_market_call::register(
                self.infra_market.get(),
                trading_addr,
                documentation,
                block_timestamp() + 1,
                deadline_add_two_weeks,
            )?;
        }

        Ok(trading_addr)
    }
}
