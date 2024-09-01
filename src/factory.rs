// Factory creates the Trading contracts with a proxy, and deploys the
// proxies to the ERC20 assets.

use stylus_sdk::{
    alloy_primitives::{aliases::*, *},
    prelude::*,
    storage::*,
};

use crate::{error::*, immutables::*, longtail, proxy, share};

#[solidity_storage]
#[entrypoint]
pub struct Factory {
    version: StorageU8,

    enabled: StorageBool,

    oracle: StorageAddress,

    // ERC20 implementation to create proxies in front of.
    erc20_impl: StorageAddress,

    // Trading implementation to create proxies in front of.
    trading_impl: StorageAddress,

    // Longtail to create pools with for trading.
    longtail_addr: StorageAddress,
}

#[external]
impl Factory {
    pub fn ctor(
        &mut self,
        oracle_addr: Address,
        erc20_impl: Address,
        trading_impl: Address,
        longtail_addr: Address,
    ) -> Result<(), Vec<u8>> {
        assert_or!(self.version.get().is_zero(), Error::AlreadyConstructed);
        self.enabled.set(true);
        self.oracle.set(oracle_addr);
        self.version.set(U8::from(1));
        self.erc20_impl.set(erc20_impl);
        self.trading_impl.set(trading_impl);
        self.longtail_addr.set(longtail_addr);
        Ok(())
    }

    // Construct a new Trading construct, taking from the user some outcomes
    // and their day 1 odds.
    pub fn new_trading(&self, outcomes: Vec<(FixedBytes<8>, U256)>) -> Result<Address, Vec<u8>> {
        // First, take the amounts used as the seed number from the user.
        assert_or!(outcomes.len() > 1, Error::MustContainOutcomes);
        let money = outcomes.iter().map(|(_, i)| i.clone()).sum::<U256>();
        assert_or!(!money.is_zero(), Error::OddsMustBeSet);

        let outcomes = outcomes
            .into_iter()
            .map(|(c, _)| c)
            .collect::<Vec<FixedBytes<8>>>();

        let outcome_identifiers = outcomes
            .iter()
            .map(|c| c.as_slice())
            .collect::<Vec<&[u8]>>();

        // Create the trading identifier to derive the outcome addresses from.
        let trading_identifier = proxy::create_identifier(&outcome_identifiers);

        // Deploy the contract, and emit a log that it was created.
        let trading_addr = proxy::deploy(trading_identifier, self.trading_impl.get())?;

        let oracle = self.oracle.get();

        /*evm::log(events::NewTrading {
            identifier: trading_identifier,
            addr: trading_addr,
            oracle,
        });*/

        for outcome_identifier in outcome_identifiers {
            // Create the share contract using the root identifier as the root, and the
            // identifier for the share contract as the base.
            let erc20_identifier =
                proxy::create_identifier(&[trading_identifier.as_ref(), &outcome_identifier]);
            let erc20_addr = proxy::deploy(erc20_identifier, self.erc20_impl.get())?;

            // Set up the share ERC20 asset, with the description.
            share::ctor(erc20_addr, outcome_identifier, trading_addr)?;

            // Use Longtail to create a pool for this share, then enable it with odds baked into
            // the contract. Use a volatile asset price.
            longtail::create_pool(
                erc20_addr,
                U256::ZERO,
                LONGTAIL_FEE,
                LONGTAIL_TICK_SPACING,
                LONGTAIL_MAX_LIQ_PER_TICK,
            )?;

            /*evm::log(events::OutcomeCreated {
                tradingIdentifier: trading_identifier,
                erc20Identifier: erc20_identifier,
                erc20Addr: erc20_addr,
            }); */
        }

        Ok(trading_addr)
    }
}
