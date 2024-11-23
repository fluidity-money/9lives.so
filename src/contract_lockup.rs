use stylus_sdk::{alloy_primitives::*, block, contract, evm, msg, prelude::*};

use rust_decimal::Decimal;

use crate::error::Error;

#[storage]
#[cfg_attr(feature = "contract-lockup", entrypoint)]
pub struct StorageLockup {
    /// Was this contract created successfully?
    created: StorageU256,

    /// Is the contract enabled? Did an emergency take place?
    enabled: StorageBool,

    /// Deployed infrastructure market address.
    infra_market_addr: StorageAddress,

    /// 9lives Locked ARB token that we're controlling.
    token_addr: StorageAddress,

    /// Global amount of liquidity locked up by everyone.
    pub liquidity: StorageU256,

    /// Debt id counter for returning funds.
    pub debt_id_counter: StorageU256,

    /// Amounts locked up by users.
    pub locked_initial: StorageMap<U256, StorageU256>,

    /// Amount of locked voting power that must be paid in full to get amounts back.
    pub locked_voting_power: StorageMap<U256, StorageU256>,

    /// Locked positions held by the user. This is used to slash a user's entire position
    /// on request.
    pub locked_debt_ids: StorageMap<Address, StorageVec<U256>>
}

#[cfg_attr(feature = "contract-lockup", stylus_sdk::prelude::public)]
impl StorageLockup {
    pub fn ctor(&mut self, token: Address, infra_market: Address) -> Result<(), Error> {
        assert_or!(self.enabled.is_zero(), Error::AlreadyExists);
        self.enabled.set(true);
        self.token_addr.set(token);
        self.infra_market_addr.set(infra_market);
        Ok(())
    }

    /// Lockup sends Locked ARB to the user after taking Staked ARB from
    /// them. The amount they receive is distributed according to a curve.
    pub fn lockup(
        &mut self,
        amt: U256,
        until_timestamp: u64,
    ) -> Result<U256, Error> {
        let debt_id = self.debt_id_counter;
        self.debt_id_counter.set(debt_id + U256::from(1));
        // Lock up the amounts for the user, giving them back some Locked ARB.
        erc20_call::transfer_from(STAKED_ARB_ADDR, msg::sender(), contract::address(), amount)?;
        let voting_power = maths::locked_arb_amt(amt)?;
        self.locked_initial.setter(debt_id).set(amt);
        self.locked_voting_power.setter(debt_id).set(voting_power);
        self.locked_debt_ids.setter(recipient).push(debt_id);
        ninelives_locked_arb_call::mint(self.token.get(), recipient, voting_power);
        Ok(voting_power)
    }

    pub fn slash(&mut self, addr: Address) -> Result<(), Error> {
        assert_or!(msg::sender() == self.infra_market_addr.get(), Error::NotInfraMarket);
        let debt_ids_len = self.locked_debt_ids.getter(addr).len();
        let mut amt_token = U256::ZERO;
        for i in 0..debt_ids_len {
            let debt_id = self.locked_debt_ids.getter(addr).unwrap().get();
            let power = self.locked_voting_power.getter(debt_id);
            self.locked_voting_power.setter(debt_id).set(U256::ZERO);
            amt_token += power;
        }
        ninelives_locked_arb_call::burn(self.token.get(), recipient, amt_token)?;
        Ok(())
    }
}
