// Factory creates the Trading contracts with a proxy, and deploys the
// proxies to the ERC20 assets.

use stylus_sdk::{
    alloy_primitives::{aliases::*, *},
    evm, msg,
};

use crate::{
    decimal::{fusdc_decimal_to_u256, fusdc_u256_to_decimal},
    error::*,
    events, fusdc_call,
    immutables::*,
    longtail_call, maths, proxy, share_call, trading_call,
};

pub use crate::factory_storage::*;

use rust_decimal::Decimal;

#[cfg_attr(feature = "factory-1", stylus_sdk::prelude::public)]
impl StorageFactory {
    // Construct a new Trading construct, taking from the user some outcomes
    // and their day 1 odds.
    #[allow(non_snake_case)]
    pub fn new_trading_C_11_A_A_A_3_B(
        &mut self,
        outcomes: Vec<(FixedBytes<8>, U256)>,
    ) -> Result<Address, Vec<u8>> {
        assert_or!(!outcomes.is_empty(), Error::MustContainOutcomes);

        let outcome_identifiers = outcomes.iter().map(|(c, _)| c).collect::<Vec<_>>();

        // Create the trading identifier to derive the outcome addresses from.
        let trading_id = proxy::create_identifier(
            &outcome_identifiers
                .iter()
                .map(|c| c.as_slice())
                .collect::<Vec<_>>(),
        );

        // Deploy the contract, and emit a log that it was created.
        let trading_addr = proxy::deploy_trading(trading_id)?;

        self.trading_contracts
            .setter(trading_addr)
            .set(msg::sender());

        let oracle = self.oracle.get();

        evm::log(events::NewTrading {
            identifier: trading_id,
            addr: trading_addr,
            oracle,
        });

        // We take the amount that the user has allocated to the outcomes, and
        // send it to the trading contract, which assumes it has the money it's entitled to.

        let fusdc_amt = outcomes.iter().map(|(_, i)| i).sum::<U256>();
        assert_or!(fusdc_amt > U256::ZERO, Error::OddsMustBeSet);
        fusdc_call::take_from_sender_to(trading_addr, fusdc_amt)?;

        // Used for the price function for seeding Longtail.

        let m_1 = fusdc_u256_to_decimal(fusdc_amt)?;
        let n_1 = outcome_identifiers.len();
        let n_2 = n_1 - 1;

        for (outcome_identifier, seed_amt) in outcomes.iter() {
            let erc20_identifier =
                proxy::create_identifier(&[trading_addr.as_ref(), outcome_identifier.as_slice()]);
            let erc20_addr = proxy::deploy_erc20(erc20_identifier)?;

            let m_2 = m_1 - fusdc_u256_to_decimal(*seed_amt)?;

            // Set up the share ERC20 asset, with the description.
            share_call::ctor(erc20_addr, *outcome_identifier, trading_addr)?;

            // We use the sqrt price to seed Longtail with the initial trading amounts for this
            // so there's an immediate arbitrage opportunity for LPing.

            /* let sqrt_price = maths::price_to_sqrt_price(fusdc_decimal_to_u256(maths::price(
                m_1,
                m_2,
                Decimal::from(n_1),
                Decimal::from(n_2),
                Decimal::ZERO,
            )?)?)?; */

            let sqrt_price = U256::from(1);

            // Use Longtail to create a pool for this share for aftermarket trading.
            longtail_call::create_pool(
                erc20_addr,
                sqrt_price,
                LONGTAIL_FEE,
                LONGTAIL_TICK_SPACING,
                LONGTAIL_MAX_LIQ_PER_TICK,
            )?;

            longtail_call::enable_pool(erc20_addr)?;

            evm::log(events::OutcomeCreated {
                tradingIdentifier: trading_id,
                erc20Identifier: erc20_identifier,
                erc20Addr: erc20_addr,
            });
        }

        trading_call::ctor(trading_addr, oracle, outcomes)?;

        Ok(trading_addr)
    }
}

#[cfg(all(feature = "testing", not(target_arch = "wasm32")))]
impl crate::host::StorageNew for StorageFactory {
    fn new(i: U256, v: u8) -> Self {
        unsafe { <Self as stylus_sdk::storage::StorageType>::new(i, v) }
    }
}
