use stylus_sdk::{alloy_primitives::*, contract, msg};

use crate::{fusdc_call, maths, erc20_call, error::Error, immutables::*};

pub use crate::{nineliveslockedarb_call, storage_lockup::*};

#[cfg_attr(feature = "contract-lockup", stylus_sdk::prelude::public)]
impl StorageLockup {
    pub fn ctor(&mut self, token: Address, infra_market: Address) -> Result<(), Error> {
        assert_or!(!self.created.get(), Error::AlreadyConstructed);
        self.enabled.set(true);
        self.token_addr.set(token);
        self.infra_market_addr.set(infra_market);
        Ok(())
    }

    /// Lockup sends Locked ARB to the user after taking Staked ARB from
    /// them. The amount they receive is distributed according to a curve.
    pub fn lockup(&mut self, amt: U256, _until_timestamp: u64, recipient: Address) -> Result<U256, Error> {
        let debt_id = self.debt_id_counter.get();
        self.debt_id_counter.set(debt_id + U256::from(1));
        // Lock up the amounts for the user, giving them back some Locked ARB.
        erc20_call::transfer_from(STAKED_ARB_ADDR, msg::sender(), contract::address(), amt)?;
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
            msg::sender() == self.infra_market_addr.get(),
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
            msg::sender() == self.infra_market_addr.get(),
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
            msg::sender() == self.infra_market_addr.get(),
            Error::NotInfraMarket
        );
        self.deadlines.setter(spender).set(U64::from(until));
        Ok(())
    }
}
