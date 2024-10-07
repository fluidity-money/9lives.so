// Factory creates the Trading contracts with a proxy, and deploys the
// proxies to the ERC20 assets.

use stylus_sdk::{
    alloy_primitives::{aliases::*, *},
    contract, evm, msg,
    prelude::*,
    storage::*,
    abi,
};

use crate::{
    error::*, events, fusdc_call, immutables::*, longtail_call, proxy, share_call, trading_call,
};

#[storage]
#[cfg_attr(all(target_arch = "wasm32", feature = "factory"), entrypoint)]
pub struct Factory {
    version: StorageU8,
    enabled: StorageBool,
    oracle: StorageAddress,

    // Trading contracts that were created by this Factory
    created: StorageMap<Address, StorageBool>,
}

#[public]
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
    pub fn new_trading(
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

        self.created.setter(trading_addr).set(true);

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

        for outcome_identifier in outcome_identifiers {
            let erc20_identifier =
                proxy::create_identifier(&[trading_addr.as_ref(), outcome_identifier.as_slice()]);
            let erc20_addr = proxy::deploy_erc20(erc20_identifier)?;

            // Set up the share ERC20 asset, with the description.
            share_call::ctor(erc20_addr, *outcome_identifier, trading_addr)?;

            // Use Longtail to create a pool for this share, then enable it with a 50/50 price.
            longtail_call::create_pool(
                erc20_addr,
                LONGTAIL_PRICE,
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

    pub fn trading_bytecode(&self) -> Result<abi::Bytes, Error> {
        Ok(abi::Bytes::from(trading_proxy_code().to_vec()))
    }

    pub fn was_created(&self, addr: Address) -> Result<bool, Error> {
        Ok(self.created.getter(addr).get())
    }

    /// Disable shares from being traded via Longtail.
    pub fn disable_shares(&self, outcomes: Vec<FixedBytes<8>>) -> Result<(), Error> {
        assert_or!(
            self.created.getter(msg::sender()).get(),
            Error::NotTradingContract
        );
        // Start to derive the outcomes that were given to find the share addresses.
        for outcome_id in outcomes {
            longtail_call::pause_pool(proxy::get_share_addr(
                contract::address(),
                msg::sender(),
                outcome_id,
            ))?;
        }
        Ok(())
    }
}

#[cfg(all(feature = "testing", not(target_arch = "wasm32")))]
impl crate::host::StorageNew for Factory {
    fn new(i: U256, v: u8) -> Self {
        unsafe { <Self as stylus_sdk::storage::StorageType>::new(i, v) }
    }
}
