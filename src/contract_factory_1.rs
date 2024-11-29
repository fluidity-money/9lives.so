// Factory creates the Trading contracts with a proxy, and deploys the
// proxies to the ERC20 assets.

use stylus_sdk::{
    alloy_primitives::{aliases::*, *},
    evm, msg,
};

use crate::{
    amm_call,
    decimal::{fusdc_decimal_to_u256, fusdc_u256_to_decimal},
    error::*,
    events, fusdc_call,
    immutables::*,
    opt_infra_market_call, maths, proxy, share_call, trading_call,
};

pub use crate::storage_factory::*;

use rust_decimal::Decimal;

#[cfg_attr(feature = "contract-factory-1", stylus_sdk::prelude::public)]
impl StorageFactory {
    // Construct a new Trading construct, taking from the user some outcomes
    // and their day 1 odds. We use these to seed the liquidity but only take
    // as much as the amount that the pool was made for.
    #[allow(non_snake_case)]
    pub fn new_trading_09393_D_A_8(
        &mut self,
        outcomes: Vec<(FixedBytes<8>, U256, String)>,
        oracle: Address,
        time_start: u64,
        time_ending: u64,
        documentation: FixedBytes<32>,
        fee_recipient: Address,
    ) -> R<Address> {
        assert_or!(!outcomes.is_empty(), Error::MustContainOutcomes);

        let outcome_ids = outcomes.iter().map(|(c, _, _)| c).collect::<Vec<_>>();

        // Create the trading identifier to derive the outcome addresses from.
        let trading_id =
            proxy::create_identifier(&outcome_ids.iter().map(|c| c.as_slice()).collect::<Vec<_>>());

        let backend_is_dpm = outcome_ids.len() == 2;
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
                trading_id,
            )
        } else {
            proxy::deploy_trading(
                self.trading_amm_extras_impl.get(),
                self.trading_amm_mint_impl.get(),
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
            backend: backend_type.into(),
        });

        // We take the amount that the user has allocated to the outcomes, and
        // send it to the trading contract, which assumes it has the money it's entitled to.

        let seed_liq = U256::from(outcome_ids.len()) * SHARE_DECIMALS_EXP;
        fusdc_call::take_from_sender_to(trading_addr, seed_liq)?;

        // Used for the price function for seeding Longtail.

        let m_1 = fusdc_u256_to_decimal(seed_liq)?;
        let n_1 = outcome_ids.len();
        let n_2 = n_1 - 1;

        for (outcome_identifier, seed_amt, outcome_name) in outcomes.iter() {
            let erc20_identifier =
                proxy::create_identifier(&[trading_addr.as_ref(), outcome_identifier.as_slice()]);
            let erc20_addr = proxy::deploy_erc20(self.share_impl.get(), erc20_identifier)
                .map_err(|_| Error::DeployError)?;

            let m_2 = m_1 - fusdc_u256_to_decimal(*seed_amt)?;

            // Set up the share ERC20 asset, with the description.
            share_call::ctor(erc20_addr, outcome_name.clone(), trading_addr)?;

            // We use the sqrt price to seed Longtail with the initial trading amounts for this
            // so there's an immediate arbitrage opportunity for LPing.

            let sqrt_price = maths::price_to_sqrt_price(fusdc_decimal_to_u256(maths::dpm_price(
                m_1,
                m_2,
                Decimal::from(n_1),
                Decimal::from(n_2),
                Decimal::ZERO,
            )?)?)?;

            // Use the current AMM to create a pool of this share for aftermarket trading.
            amm_call::enable_pool(amm_call::create_pool(erc20_addr, sqrt_price, LONGTAIL_FEE)?)?;

            evm::log(events::OutcomeCreated {
                tradingIdentifier: trading_id,
                erc20Identifier: erc20_identifier,
                erc20Addr: erc20_addr,
            });
        }

        let outcome_ids = outcomes.into_iter().map(|(c, _, _)| c).collect::<Vec<_>>();

        trading_call::ctor(
            trading_addr,
            outcome_ids,
            oracle,
            time_start,
            time_ending,
            fee_recipient,
        )?;

        // If the infra market wasn't chosen, then we assume that the caller has done
        // some setup work to ensure that this is fine. The caller should be very
        // careful regarding the circumstances of their oracle choice, and it should be
        // explained in the UI if this is the case or not.
        if oracle == self.infra_market.get() {
            opt_infra_market_call::register(
                self.infra_market.get(),
                trading_addr,
                msg::sender(),
                documentation,
                time_ending,
            )?;
        }

        ok(trading_addr)
    }
}

#[cfg(all(feature = "testing", not(target_arch = "wasm32")))]
impl crate::host::StorageNew for StorageFactory {
    fn new(i: U256, v: u8) -> Self {
        unsafe { <Self as stylus_sdk::storage::StorageType>::new(i, v) }
    }
}
