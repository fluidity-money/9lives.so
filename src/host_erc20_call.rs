#![cfg(not(target_arch = "wasm32"))]

use std::{cell::RefCell, collections::HashMap};

use stylus_sdk::alloy_primitives::{Address, FixedBytes, U256};

use crate::{error::Error, utils::contract_address};

thread_local! {
    static BALANCES: RefCell<HashMap<Address, HashMap<Address, U256>>> = RefCell::new(HashMap::new());
}

#[doc(hidden)]
pub fn testing_give_tokens(addr: Address, recipient: Address, amt: U256) {
    BALANCES.with(|b| {
        let mut b = b.borrow_mut();
        let b = match b.get_mut(&addr) {
            Some(b) => b,
            None => {
                b.insert(addr, HashMap::new());
                b.get_mut(&addr).unwrap()
            }
        };
        let existing_bal = match b.get_mut(&recipient) {
            None => U256::ZERO,
            Some(v) => *v,
        };
        b.insert(recipient, amt + existing_bal)
    });
}

pub fn transfer_from(
    addr: Address,
    spender: Address,
    recipient: Address,
    amount: U256,
) -> Result<(), Error> {
    BALANCES
        .with(|b| -> Option<()> {
            let mut b = b.borrow_mut();
            let b = b.get_mut(&addr)?;
            let x = b.get(&spender)?;
            if *x >= amount {
                b.insert(spender, x - amount)
            } else {
                None
            }?;
            Some(())
        })
        .ok_or(Error::ERC20ErrorTransfer(addr, format!("{spender} => {recipient} no bal").into()))?;
    testing_give_tokens(addr, recipient, amount);
    Ok(())
}

pub fn transfer(addr: Address, recipient: Address, value: U256) -> Result<(), Error> {
    transfer_from(addr, contract_address(), recipient, value)
}

#[allow(clippy::too_many_arguments)]
pub fn permit(
    _addr: Address,
    _owner: Address,
    _spender: Address,
    _value: U256,
    _deadline: U256,
    _v: u8,
    _r: FixedBytes<32>,
    _s: FixedBytes<32>,
) -> Result<(), Error> {
    Ok(())
}

pub fn balance_of(addr: Address, spender: Address) -> Result<U256, Error> {
    Ok(
        match BALANCES.with(|b| b.borrow().get(&addr)?.get(&spender).map(|v| v.clone())) {
            Some(v) => v,
            None => U256::ZERO,
        },
    )
}
