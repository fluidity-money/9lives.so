#![cfg(not(target_arch = "wasm32"))]

use std::{cell::RefCell, collections::HashMap};

use stylus_sdk::alloy_primitives::{Address, FixedBytes, U256};

use crate::{
    decimal::u256_to_decimal,
    error::{rename_addr, Error},
    immutables,
    utils::contract_address,
};

thread_local! {
    static BALANCES: RefCell<HashMap<Address, HashMap<Address, U256>>> =
        RefCell::new(HashMap::new());
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

#[macro_export]
macro_rules! should_spend_fusdc {
    ($args:tt, $func:expr) => {
        $crate::should_spend!($crate::immutables::FUSDC_ADDR, $args, $func)
    };
}

#[macro_export]
macro_rules! should_spend_fusdc_sender {
    ($amt:expr, $func:expr) => {
        $crate::should_spend_fusdc!(
            {msg_sender() => $amt},
            $func
        )
    }
}

#[macro_export]
macro_rules! should_spend_fusdc_contract {
    ($amt:expr, $func:expr) => {
        $crate::should_spend_fusdc!(
            {$crate::utils::contract_address() => $amt},
            $func
        )
    }
}

#[macro_export]
macro_rules! should_spend_staked_arb {
    ($args:tt, $func:expr) => {
        $crate::should_spend!($crate::immutables::STAKED_ARB_ADDR, $args, $func)
    };
}

#[macro_export]
macro_rules! should_spend_staked_arb_sender {
    ($amt:expr, $func:expr) => {
        $crate::should_spend_staked_arb!(
            {msg_sender() => $amt},
            $func
        )
    }
}

#[macro_export]
macro_rules! should_spend_staked_arb_contract {
    ($amt:expr, $func:expr) => {
        $crate::should_spend_staked_arb!(
            {$crate::utils::contract_address() => $amt},
            $func
        )
    }
}

pub fn test_give_tokens(addr: Address, recipient: Address, amt: U256) {
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
        b.insert(recipient, amt.wrapping_add(existing_bal));
    });
}

pub fn test_reset_bal(addr: Address, recipient: Address) {
    BALANCES.with(|b| -> Option<()> {
        let mut b = b.borrow_mut();
        b.get_mut(&addr)?.insert(recipient, U256::ZERO);
        Some(())
    });
}

#[macro_export]
macro_rules! give_then_reset_token {
    ($token:expr, $addr:expr, $amt:expr, $func:expr) => {
        $crate::host_erc20_call::test_give_tokens($token, $addr, $amt);
        let v = $func;
        $crate::host_erc20_call::test_reset_bal($token, $addr);
        v.unwrap()
    };
}

/// Go through each token that we have as defaults, and set their balances to max, then at
/// the end, go through them again, and set them to 0. This is only useful for situations
/// where you might want to induce an error.
pub fn max_bals_guard<T>(spender: Address, f: impl FnOnce() -> T) -> T {
    use immutables::*;
    let tokens = [FUSDC_ADDR, STAKED_ARB_ADDR, TESTING_SHARE_ADDR];
    for t in tokens {
        test_give_tokens(t, spender, U256::MAX);
    }
    let x = f();
    for t in tokens {
        test_reset_bal(t, spender);
    }
    x
}

fn safe_print(x: U256, d: u8) -> String {
    match x {
        U256::MAX => "max".to_string(),
        _ => u256_to_decimal(x, d).unwrap().to_string(),
    }
}

fn rename_amt(a: Address, v: U256) -> String {
    use crate::immutables::*;
    match a {
        FUSDC_ADDR => format!("$fusdc {}", safe_print(v, FUSDC_DECIMALS)),
        TESTING_SHARE_ADDR => format!("$share {}", safe_print(v, SHARE_DECIMALS)),
        STAKED_ARB_ADDR => format!("ARB{}", safe_print(v, STAKED_ARB_DECIMALS)),
        _ => format!("unknown token amt {}", v),
    }
}

// Test that each of theses addresses should spend the amounts given,
// returning ERC20 Transfer Error if they fail to return to 0 balance at
// the end of this function. It will hygienically (and perhaps, wastefully)
// wipe the slate clean of balance for the address and token given.
pub fn should_spend<T>(
    addr: Address,
    spenders: HashMap<Address, U256>,
    f: impl FnOnce() -> Result<T, Error>,
) -> Result<T, Error> {
    for (r, amt) in spenders.clone() {
        test_give_tokens(addr, r, amt)
    }
    let x = f();
    // Wipe the balances of the spenders.
    for k in spenders.keys() {
        test_reset_bal(addr, *k);
    }
    if x.is_err() {
        return x;
    }
    for (k, v) in spenders {
        let b = balance_of(addr, k).unwrap();
        if !b.is_zero() {
            return Err(Error::ERC20ErrorTransfer(
                addr,
                format!(
                    "{} has leftover bal {}, they started with {}",
                    rename_addr(addr),
                    rename_amt(addr, v),
                    rename_amt(addr, b),
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
        .with(|b| -> Result<(), U256> {
            let mut b = b.borrow_mut();
            let b = b.get_mut(&addr).ok_or(U256::ZERO)?;
            let x = b.get(&spender).ok_or(U256::ZERO)?;
            if *x >= amount {
                let _ = b.insert(spender, x - amount);
                Ok(())
            } else {
                Err(*x)
            }
        })
        .map_err(|cur_bal| Error::ERC20ErrorTransfer(
            addr,
            format!(
                "{} sending {} to {}: bal was {}",
                rename_addr(spender),
                rename_amt(addr, amount),
                rename_addr(recipient),
                rename_amt(addr, cur_bal)
            )
            .into(),
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
