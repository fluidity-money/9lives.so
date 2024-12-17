#![cfg(not(target_arch = "wasm32"))]

use std::{cell::RefCell, collections::HashMap};

use stylus_sdk::alloy_primitives::{Address, FixedBytes, U256};

use crate::{
    decimal::u256_to_decimal,
    error::{rename_addr, Error},
    immutables,
    utils::{contract_address},
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
        b.insert(recipient, amt.wrapping_add(existing_bal));
    });
}

fn test_reset_bal(addr: Address, recipient: Address) {
    BALANCES.with(|b| -> Option<()> {
        let mut b = b.borrow_mut();
        b.get_mut(&addr)?.insert(recipient, U256::ZERO);
        Some(())
    });
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
    // Wipe their balances clean before returning (useful for proptest)
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
            format!(
                "{} sending {} to {}: no bal",
                rename_addr(spender),
                rename_amt(addr, amount),
                rename_addr(recipient),
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
