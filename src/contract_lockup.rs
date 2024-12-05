use stylus_sdk::{alloy_primitives::*, contract, evm};

use crate::{erc20_call, error::Error, fusdc_call, immutables::*, maths, utils::msg_sender};

pub use crate::{events, nineliveslockedarb_call, proxy, storage_lockup::*};

#[cfg_attr(feature = "contract-lockup", stylus_sdk::prelude::public)]
impl StorageLockup {
    pub fn ctor(&mut self, token_impl: Address, infra_market: Address) -> Result<(), Error> {
        assert_or!(!self.created.get(), Error::AlreadyConstructed);
        let token =
            proxy::deploy_proxy(token_impl).map_err(|_| Error::NinelivesLockedArbCreateError)?;
        nineliveslockedarb_call::ctor(token, contract::address())?;
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
    /// them. The amount they receive is distributed according to a curve.
    pub fn lockup(
        &mut self,
        amt: U256,
        _until_timestamp: u64,
        recipient: Address,
    ) -> Result<U256, Error> {
        let debt_id = self.debt_id_counter.get();
        self.debt_id_counter.set(debt_id + U256::from(1));
        // Lock up the amounts for the user, giving them back some Locked ARB.
        erc20_call::transfer_from(STAKED_ARB_ADDR, msg_sender(), contract::address(), amt)?;
        let voting_power = maths::locked_arb_amt(amt)?;
        self.locked_initial.setter(debt_id).set(amt);
        self.locked_voting_power.setter(debt_id).set(voting_power);
        self.locked_debt_ids.setter(recipient).push(debt_id);
        let existing_arb = self.locked_arb_user.get(recipient);
        self.locked_arb_user.setter(recipient).set(
            existing_arb
                .checked_add(amt)
                .ok_or(Error::CheckedAddOverflow)?,
        );
        nineliveslockedarb_call::mint(self.token_addr.get(), recipient, voting_power)?;
        Ok(voting_power)
    }

    pub fn staked_arb_bal(&self, addr: Address) -> Result<U256, Error> {
        Ok(self.locked_arb_user.get(addr))
    }

    pub fn slash(&mut self, addr: Address) -> Result<(), Error> {
        assert_or!(
            msg_sender() == self.infra_market_addr.get(),
            Error::NotInfraMarket
        );
        let debt_ids_len = self.locked_debt_ids.getter(addr).len();
        let mut amt_token = U256::ZERO;
        for i in 0..debt_ids_len {
            let debt_id = self.locked_debt_ids.getter(addr).get(i).unwrap();
            let power = self.locked_voting_power.get(debt_id);
            self.locked_voting_power.setter(debt_id).set(U256::ZERO);
            amt_token += power;
        }
        nineliveslockedarb_call::burn(self.token_addr.get(), addr, amt_token)?;
        Ok(())
    }

    pub fn confiscate(&mut self, victim: Address, recipient: Address) -> Result<U256, Error> {
        assert_or!(
            msg_sender() == self.infra_market_addr.get(),
            Error::NotInfraMarket
        );
        let debt_ids_len = self.locked_debt_ids.getter(victim).len();
        for i in 0..debt_ids_len {
            let debt_id = self.locked_debt_ids.getter(victim).get(i).unwrap();
            self.locked_initial.setter(debt_id).set(U256::ZERO);
        }
        let locked_arb = self.locked_arb_user.get(victim);
        self.locked_arb_user.setter(victim).set(U256::ZERO);
        fusdc_call::transfer(recipient, locked_arb)?;
        Ok(locked_arb)
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
                until
            } else {
                existing_deadline
            });
        Ok(())
    }
}
