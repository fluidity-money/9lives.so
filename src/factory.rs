// Factory creates the Trading contracts with a proxy, and deploys the
// proxies to the ERC20 assets.

use stylus_sdk::{
    alloy_primitives::{aliases::*, *},
    msg,
    prelude::*,
    storage::*,
};

use crate::{error::*, immutables::*, longtail_call, proxy, share_call, trading_call};

#[solidity_storage]
#[entrypoint]
pub struct Factory {
    version: StorageU8,
    enabled: StorageBool,
    oracle: StorageAddress,
}

#[external]
impl Factory {
    pub fn ctor(&mut self, oracle_addr: Address) -> Result<(), Vec<u8>> {
        assert_or!(self.version.get().is_zero(), Error::AlreadyConstructed);
        self.enabled.set(true);
        self.oracle.set(oracle_addr);
        self.version.set(U8::from(1));
        Ok(())
    }

    // Construct a new Trading construct, taking from the user some outcomes
    // and their day 1 odds.
    pub fn new_trading(&self, outcomes: Vec<(FixedBytes<8>, U256)>) -> Result<Address, Vec<u8>> {
        assert_or!(outcomes.len() > 0, Error::MustContainOutcomes);

        let outcome_identifiers = outcomes
            .iter()
            .map(|(c, _)| c.as_slice())
            .collect::<Vec<&[u8]>>();

        // Create the trading identifier to derive the outcome addresses from.
        let trading_identifier = proxy::create_identifier(&outcome_identifiers);

        // Deploy the contract, and emit a log that it was created.
        let trading_addr = proxy::deploy_trading(trading_identifier)?;

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
                proxy::create_identifier(&[trading_addr.as_ref(), &outcome_identifier]);
            let erc20_addr = proxy::deploy_erc20(erc20_identifier)?;

            // Set up the share ERC20 asset, with the description.
            share_call::ctor(erc20_addr, outcome_identifier, trading_addr)?;

            // Use Longtail to create a pool for this share, then enable it with odds baked into
            // the contract. Use a volatile asset price.
            longtail_call::create_pool(
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

        trading_call::ctor(trading_addr, oracle, msg::sender(), &outcomes)?;

        Ok(trading_addr)
    }
}
