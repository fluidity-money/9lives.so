#![cfg(not(target_arch = "wasm32"))]

use std::{cell::RefCell, collections::HashMap};

use stylus_sdk::alloy_primitives::{Address, FixedBytes, U256};

use crate::{
    error::Error,
    utils::{contract_address, msg_sender},
    immutables::*
};

thread_local! {
    static BALANCES: RefCell<HashMap<Address, HashMap<Address, U256>>> = RefCell::new(HashMap::new());
}

#[macro_export]
macro_rules! should_spend {
    (
        $addr:expr,
        { $( $key:expr => $value:expr ),* $(,)? },
        $func:expr
    ) => {
        $crate::host_erc20_call::should_spend(
            $addr,
            map_macro::hash_map! { $( $key => $value ),* },
            || { $func }
        ).unwrap()
    };
}

fn test_give_tokens(addr: Address, recipient: Address, amt: U256) {
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
        b.insert(recipient, amt + existing_bal);
    });
}

// Test that each of theses addresses should spend the amounts given,
// returning ERC20 Transfer Error if they fail to return to 0 balance at
// the end of this function. Obviously does not cope well with poorly
// managed side effects from earlier.
pub fn should_spend<T>(
    addr: Address,
    spenders: HashMap<Address, U256>,
    f: impl FnOnce() -> Result<T, Error>,
) -> Result<T, Error> {
    for (r, amt) in spenders.clone() {
        test_give_tokens(addr, r, amt)
    }
    let x = f();
    if x.is_err() {
        return x;
    }
    for (k, _) in spenders {
        let b = balance_of(addr, k).unwrap();
        if !b.is_zero() {
            return Err(Error::ERC20ErrorTransfer(
                addr,
                format!(
                    "{} has leftover bal {b}",
                    match k {
                        FUSDC_ADDR => "fusdc contract".to_owned(),
                        LONGTAIL_ADDR => "longtail contract".to_owned(),
                        STAKED_ARB_ADDR => "staked arb contract".to_owned(),
                        x =>
                            if x == msg_sender() {
                                "msg sender".to_owned()
                            } else {
                                format!("{:?}", x)
                            }
                    }
                )
                .into(),
            ));
        }
    }
    x
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
        .ok_or(Error::ERC20ErrorTransfer(
            addr,
            format!("{spender} =[{amount}]> {recipient} no bal").into(),
        ))?;
    test_give_tokens(addr, recipient, amount);
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
