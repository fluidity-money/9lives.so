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
    infra_market_call, maths, proxy, share_call, trading_call,
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

        let outcome_identifiers = outcomes.iter().map(|(c, _, _)| c).collect::<Vec<_>>();

        // Create the trading identifier to derive the outcome addresses from.
        let trading_id = proxy::create_identifier(
            &outcome_identifiers
                .iter()
                .map(|c| c.as_slice())
                .collect::<Vec<_>>(),
        );

        // Deploy the contract, and emit a log that it was created.
        let trading_addr = proxy::deploy_trading(
            self.trading_extras_impl.get(),
            self.trading_mint_impl.get(),
            trading_id,
        )
        .map_err(|_| Error::DeployError)?;

        self.trading_contracts
            .setter(trading_addr)
            .set(msg::sender());

        evm::log(events::NewTrading {
            identifier: trading_id,
            addr: trading_addr,
            oracle,
        });

        // We take the amount that the user has allocated to the outcomes, and
        // send it to the trading contract, which assumes it has the money it's entitled to.

        let seed_liq = U256::from(outcome_identifiers.len()) * SHARE_DECIMALS_EXP;
        fusdc_call::take_from_sender_to(trading_addr, seed_liq)?;

        // Used for the price function for seeding Longtail.

        let m_1 = fusdc_u256_to_decimal(seed_liq)?;
        let n_1 = outcome_identifiers.len();
        let n_2 = n_1 - 1;

        for (outcome_identifier, seed_amt, outcome_name) in outcomes.iter() {
            // For the DPM (at least right now), we can only take 1 from the user for both sides.
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

        let outcome_identifiers = outcomes.into_iter().map(|(c, _, _)| c).collect::<Vec<_>>();

        trading_call::ctor(
            trading_addr,
            outcome_identifiers,
            oracle,
            time_start,
            time_ending,
            fee_recipient,
        )?;

        if oracle == self.infra_market.get() {
            infra_market_call::register(
                self.infra_market.get(),
                trading_addr,
                msg::sender(),
                documentation,
                time_ending,
            )?;
        } else {
            unimplemented!();
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
