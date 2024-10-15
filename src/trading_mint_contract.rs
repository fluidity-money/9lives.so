// Trading contains the actual behaviour of the DPM, including the
// functions to mint, and the ability for the oracle to disable the
// trading.

use stylus_sdk::{
    alloy_primitives::{aliases::*, *},
    contract, evm, msg,
    prelude::*,
};

use crate::{
    decimal::{decimal_to_u256, u256_to_decimal},
    error::*,
    events, fusdc_call,
    immutables::*,
    maths, proxy, share_call,
};

pub use crate::trading_storage::*;

#[cfg_attr(feature = "trading-mint", entrypoint)]
#[storage]
pub struct Entrypoint {
    // Due to storage collision, this hack is possible. This shares the same
    // slot as trading_extras_contract's entrypoint.
    s: StorageTrading
}

#[cfg_attr(feature = "trading-mint", public)]
impl Entrypoint {
    fn internal_mint(
        &mut self,
        outcome_id: FixedBytes<8>,
        value: U256,
        recipient: Address,
    ) -> Result<U256, Error> {
        assert_or!(!self.s.locked.get(), Error::DoneVoting);

        // Assume we already took the user's balance. Get the state of
        // everything else as u256s.
        let outcome = self.s.outcomes.getter(outcome_id);
        let m_1 = outcome.invested.get();
        let n_1 = outcome.shares.get();
        let n_2 = self.s.shares.get();
        let m_2 = self.s.invested.get();

        // Convert everything to floats!
        let m = u256_to_decimal(value, FUSDC_DECIMALS)?;

        // Set the global states.
        self.s.outcomes.setter(outcome_id).invested.set(m_1 + m);
        self.s.invested.set(self.s.invested.get() + m);

        let shares = maths::shares(m_1, m_2, n_1, n_2, m)?;

        // Set the global states as the output of shares.
        self.s.outcomes.setter(outcome_id).shares.set(n_1 + shares);
        self.s.shares.set(self.s.shares.get() + shares);

        // Get the address of the share, then mint some in line with the
        // shares we made to the user's address!

        let share_addr = proxy::get_share_addr(FACTORY_ADDR, contract::address(), outcome_id);

        let shares = decimal_to_u256(shares, SHARE_DECIMALS)?;

        // This can happen where someone supplies too much at first. FIXME

        assert_or!(shares > U256::ZERO, Error::UnusualAmountCreated);

        share_call::mint(share_addr, recipient, shares)?;

        evm::log(events::SharesMinted {
            identifier: outcome_id,
            shareAmount: shares,
            spender: msg::sender(),
            recipient,
            fusdcSpent: value,
        });

        Ok(shares)
    }

    pub fn mint(
        &mut self,
        outcome: FixedBytes<8>,
        value: U256,
        recipient: Address,
    ) -> Result<U256, Error> {
        fusdc_call::take_from_sender(value)?;
        self.internal_mint(outcome, value, recipient)
    }

    #[allow(clippy::too_many_arguments)]
    pub fn mint_permit(
        &mut self,
        outcome: FixedBytes<8>,
        value: U256,
        recipient: Address,
        deadline: U256,
        v: u8,
        r: FixedBytes<32>,
        s: FixedBytes<32>,
    ) -> Result<U256, Error> {
        fusdc_call::take_from_sender_permit(value, deadline, v, r, s)?;
        self.internal_mint(outcome, value, recipient)
    }
}
