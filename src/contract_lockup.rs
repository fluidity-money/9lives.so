use stylus_sdk::{alloy_primitives::*, evm};

use crate::{
    erc20_call,
    error::Error,
    events,
    immutables::*,
    nineliveslockedarb_call, proxy,
    utils::{block_timestamp, contract_address, msg_sender},
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
        evm::log(events::LockupEnabled { status: true });
        Ok(())
    }

    pub fn enable_contract(&mut self, status: bool) -> Result<(), Error> {
        assert_or!(msg_sender() == self.operator.get(), Error::NotOperator);
        self.enabled.set(status);
        evm::log(events::LockupEnabled { status });
        Ok(())
    }

    pub fn token_addr(&self) -> Result<Address, Error> {
        Ok(self.token_addr.get())
    }

    /// Lockup sends Locked ARB to the user after taking Staked ARB from
    /// them.
    pub fn lockup(&mut self, amt: U256, recipient: Address) -> Result<U256, Error> {
        assert_or!(self.enabled.get(), Error::NotEnabled);
        erc20_call::transfer_from(STAKED_ARB_ADDR, msg_sender(), contract_address(), amt)?;
        // Overflow isn't likely, since we're receiving Staked ARB. If
        // they overflow, we have a bigger problem.
        nineliveslockedarb_call::mint(self.token_addr.get(), recipient, amt)?;
        evm::log(events::LockedUp {
            recipient,
            amount: amt,
        });
        Ok(amt)
    }

    pub fn withdraw(&self, amt: U256, recipient: Address) -> Result<U256, Error> {
        assert_or!(self.enabled.get(), Error::NotEnabled);
        assert_or!(
            self.deadlines.get(msg_sender()) < U64::from(block_timestamp()),
            Error::TooEarlyToWithdraw
        );
        nineliveslockedarb_call::burn(self.token_addr.get(), msg_sender(), amt)?;
        erc20_call::transfer(STAKED_ARB_ADDR, recipient, amt)?;
        evm::log(events::Withdrew {
            amount: amt,
            recipient,
        });
        Ok(amt)
    }

    pub fn staked_arb_bal(&self, addr: Address) -> Result<U256, Error> {
        erc20_call::balance_of(self.token_addr.get(), addr)
    }

    pub fn slash(&mut self, addr: Address) -> Result<(), Error> {
        assert_or!(self.enabled.get(), Error::NotEnabled);
        assert_or!(
            msg_sender() == self.infra_market_addr.get(),
            Error::NotInfraMarket
        );
        let slashed = erc20_call::balance_of(self.token_addr.get(), addr)?;
        self.slashed_amt.setter(addr).set(slashed);
        evm::log(events::Slashed {
            victim: addr,
            slashedAmount: slashed,
        });
        Ok(())
    }

    pub fn confiscate(&mut self, victim: Address, recipient: Address) -> Result<U256, Error> {
        assert_or!(self.enabled.get(), Error::NotEnabled);
        assert_or!(
            msg_sender() == self.infra_market_addr.get(),
            Error::NotInfraMarket
        );
        let amt = erc20_call::balance_of(self.token_addr.get(), victim)?;
        erc20_call::transfer(STAKED_ARB_ADDR, recipient, amt)?;
        // Reset their amount since they had their funds confiscated.
        self.slashed_amt.setter(victim).set(U256::ZERO);
        evm::log(events::Confiscated {
            victim,
            recipient,
            taken: amt,
        });
        Ok(amt)
    }

    pub fn freeze(&mut self, spender: Address, until: u64) -> Result<(), Error> {
        assert_or!(self.enabled.get(), Error::NotEnabled);
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
        evm::log(events::Frozen {
            victim: spender,
            until: u64::from_le_bytes(until.to_le_bytes()),
        });
        Ok(())
    }
}

#[cfg(all(test, feature = "testing", not(target_arch = "wasm32")))]
mod test {
    use super::*;
    use crate::{utils::{strat_address, strat_u256}, error::panic_guard};
    use proptest::prelude::*;
    proptest! {
        #[test]
        fn test_lockup_operator_pause_no_run(
            mut c in strat_storage_lockup(),
            lockup_amt in strat_u256(),
            lockup_recipient in strat_address(),
            withdraw_amt in strat_u256(),
            withdraw_recipient in strat_address(),
            slash_addr in strat_address(),
            freeze_spender in strat_address(),
            freeze_until in any::<u64>()
        ) {
            c.operator.set(msg_sender());
            c.enable_contract(false).unwrap();
            panic_guard(|| {
                let res = [
                    c.lockup(lockup_amt, lockup_recipient).unwrap_err(),
                    c.withdraw(withdraw_amt, withdraw_recipient).unwrap_err(),
                    c.slash(slash_addr).unwrap_err(),
                    c.freeze(freeze_spender, freeze_until).unwrap_err()
                ];
                for (i, f) in res.into_iter().enumerate() {
                    assert_eq!(Error::NotEnabled, f, "{i}");
                }
            });
        }
    }
}
