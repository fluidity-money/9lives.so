use stylus_sdk::{alloy_primitives::*, evm};

use crate::{
    erc20_call,
    error::Error,
    events,
    immutables::*,
    nineliveslockedarb_call, proxy,
    utils::{contract_address, block_timestamp, msg_sender},
};

pub use crate::storage_lockup::*;

#[cfg_attr(feature = "contract-lockup", stylus_sdk::prelude::public)]
impl StorageLockup {
    pub fn ctor(&mut self, token_impl: Address, infra_market: Address) -> Result<(), Error> {
        assert_or!(!self.created.get(), Error::AlreadyConstructed);
        let token =
            proxy::deploy_proxy(token_impl).map_err(|_| Error::NinelivesLockedArbCreateError)?;
        nineliveslockedarb_call::ctor(token, contract_address())?;
        evm::log(events::LockupTokenProxyDeployed { token });
        self.token_addr.set(token);
        self.infra_market_addr.set(infra_market);
        self.enabled.set(true);
        Ok(())
    }

    pub fn token_addr(&self) -> Result<Address, Error> {
        Ok(self.token_addr.get())
    }

    /// Lockup sends Locked ARB to the user after taking Staked ARB from
    /// them.
    pub fn lockup(&mut self, amt: U256, recipient: Address) -> Result<U256, Error> {
        erc20_call::transfer_from(STAKED_ARB_ADDR, msg_sender(), contract_address(), amt)?;
        // Overflow isn't likely, since we're receiving Staked ARB. If
        // they overflow, we have a bigger problem.
        nineliveslockedarb_call::mint(self.token_addr.get(), recipient, amt)?;
        Ok(amt)
    }

    pub fn withdraw(&self, amt: U256, recipient: Address) -> Result<U256, Error> {
        assert_or!(
            self.deadlines.get(msg_sender()) < U64::from(block_timestamp()),
            Error::TooEarlyToWithdraw
        );
        nineliveslockedarb_call::burn(self.token_addr.get(), msg_sender(), amt)?;
        erc20_call::transfer(STAKED_ARB_ADDR, recipient, amt)?;
        Ok(amt)
    }

    pub fn staked_arb_bal(&self, addr: Address) -> Result<U256, Error> {
        erc20_call::balance_of(self.token_addr.get(), addr)
    }

    pub fn slash(&mut self, addr: Address) -> Result<(), Error> {
        assert_or!(
            msg_sender() == self.infra_market_addr.get(),
            Error::NotInfraMarket
        );
        self.slashed_amt
            .setter(addr)
            .set(erc20_call::balance_of(self.token_addr.get(), addr)?);
        Ok(())
    }

    pub fn confiscate(&mut self, victim: Address, recipient: Address) -> Result<U256, Error> {
        assert_or!(
            msg_sender() == self.infra_market_addr.get(),
            Error::NotInfraMarket
        );
        let amt = erc20_call::balance_of(self.token_addr.get(), victim)?;
        erc20_call::transfer(STAKED_ARB_ADDR, recipient, amt)?;
        // Reset their amount since they had their funds confiscated.
        self.slashed_amt.setter(victim).set(U256::ZERO);
        Ok(amt)
    }

    pub fn freeze(&mut self, spender: Address, until: u64) -> Result<(), Error> {
        assert_or!(
            msg_sender() == self.infra_market_addr.get(),
            Error::NotInfraMarket
        );
        // Make sure that their deadline is as late as possible.
        let existing_deadline = self.deadlines.get(spender);
        let until = U64::from(until);
        self.deadlines
            .setter(spender)
            .set(if existing_deadline > until {
                existing_deadline
            } else {
                until
            });
        Ok(())
    }
}
