#![cfg(not(target_arch = "wasm32"))]

use std::{cell::RefCell, collections::HashMap};

use stylus_sdk::alloy_primitives::{Address, FixedBytes, U256};

use crate::{
    decimal::u256_to_decimal,
    error::{rename_addr, Error},
    immutables, testing_addrs,
    utils::contract_address,
};

thread_local! {
    static BALANCES: RefCell<HashMap<Address, HashMap<Address, U256>>> =
        RefCell::new(HashMap::new());

    static ERC20_WAS_USED: RefCell<HashMap<(Address, Address), bool>> =
        RefCell::new(HashMap::new());
}

pub fn cleanup() {
    BALANCES.with(|b| b.borrow_mut().clear());
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
            map_macro::hash_map! { $( $key => U256::from($value) ),* },
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

fn track_used(addr: Address, holder: Address) {
    ERC20_WAS_USED.with(|h| {
        h.borrow_mut().insert((addr, holder), true);
    });
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
        b.insert(recipient, existing_bal.checked_add(amt).unwrap());
    });
}

pub fn test_reset_tracked_used(addr: Address, spender: Address) {
    ERC20_WAS_USED.with(|h| h.borrow_mut().insert((addr, spender), false));
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

// Just burn some tokens, useful for fee accounting.
pub fn burn(addr: Address, spender: Address, amt: U256) {
    BALANCES
        .with(|b| -> Option<()> {
            let p = *b.borrow().get(&addr)?.get(&spender)?;
            *b.borrow_mut().get_mut(&addr)?.get_mut(&spender)? = p
                .checked_sub(amt)
                .expect("failed to burn token {addr} for spender {spender}, {amt}, has {p}");
            Some(())
        })
        .expect("went to burn {addr} for spender {spender}, no bal")
}

fn safe_print(x: U256, d: u8) -> String {
    match x {
        U256::MAX => "max".to_string(),
        _ => match u256_to_decimal(x, d) {
            Ok(x) => x.to_string(),
            Err(_) => format!("massive number: {x}"),
        },
    }
}

fn rename_amt(a: Address, v: U256) -> String {
    match a {
        immutables::FUSDC_ADDR => format!("$fusdc {}", safe_print(v, immutables::FUSDC_DECIMALS)),
        testing_addrs::SHARE => format!("$share {}", safe_print(v, immutables::SHARE_DECIMALS)),
        testing_addrs::STAKED_ARB => {
            format!("ARB{}", safe_print(v, immutables::STAKED_ARB_DECIMALS))
        }
        v => {
            #[cfg(all(feature = "testing", not(target_arch = "wasm32")))]
            if let Some(v) = crate::host::get_addr_expl(v) {
                return v;
            }
            format!("unknown token ({a}) amt {v}")
        }
    }
}

pub fn was_erc20_spent(token: Address, spender: Address) -> bool {
    ERC20_WAS_USED.with(|h| *h.borrow().get(&(token, spender)).unwrap_or(&false))
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
        // Also wipe the existing holdings of the spender so there's no test confusion.
        test_reset_bal(addr, r);
        test_give_tokens(addr, r, amt)
    }
    for k in spenders.keys() {
        // Wipe the tracking of the touched ERC20.
        test_reset_tracked_used(addr, *k);
    }
    let x = f();
    let v = x?;
    for (k, v) in spenders {
        let b = balance_of(addr, k).unwrap();
        if !b.is_zero() {
            return Err(Error::ERC20ErrorTransfer(
                addr,
                format!(
                    "{} has leftover bal {} ({b}), they were initially given {} ({v})",
                    rename_addr(k),
                    rename_amt(addr, b),
                    rename_amt(addr, v),
                )
                .into(),
            ));
        }
        if !was_erc20_spent(addr, k) {
            return Err(Error::ERC20ErrorTransfer(
                addr,
                format!(
                    "spending token {} with spender {} was not spent",
                    rename_addr(addr),
                    rename_addr(k)
                )
                .into(),
            ));
        }
        // Wipe the balances of the spender.
        test_reset_bal(addr, k);
    }
    Ok(v)
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
            } else {
                return Err(*x);
            }
            Ok(())
        })
        .or_else(|cur_bal| {
            // We can allow the spender here to go ahead if they have zero balance
            // and they're the mint address. This is because they might send a
            // large number of tokens in some tests that don't capture everything.
            if spender == testing_addrs::ZERO_FOR_MINT_ADDR && cur_bal.is_zero() {
                return Ok(());
            }
            Err(Error::ERC20ErrorTransfer(
                addr,
                format!(
                    "{} sending {} ({amount}) to {}: bal is {} ({cur_bal})",
                    rename_addr(spender),
                    rename_amt(addr, amount),
                    rename_addr(recipient),
                    rename_amt(addr, cur_bal)
                )
                .into(),
            ))
        })?;
    test_give_tokens(addr, recipient, amount);
    // We need to also check that the spender interacted with this token.
    track_used(addr, spender);
    track_used(addr, recipient);
    Ok(())
}

pub fn transfer(addr: Address, recipient: Address, value: U256) -> Result<(), Error> {
    transfer_from(addr, contract_address(), recipient, value)
}

#[allow(clippy::too_many_arguments)]
pub fn permit(
    addr: Address,
    owner: Address,
    spender: Address,
    value: U256,
    _deadline: U256,
    _v: u8,
    _r: FixedBytes<32>,
    _s: FixedBytes<32>,
) -> Result<(), Error> {
    transfer_from(addr, spender, owner, value)
}

pub fn balance_of(addr: Address, spender: Address) -> Result<U256, Error> {
    Ok(
        match BALANCES.with(|b| b.borrow().get(&addr)?.get(&spender).copied()) {
            Some(v) => v,
            None => U256::ZERO,
        },
    )
}

pub fn approve(_addr: Address, _spender: Address, _amount: U256) -> Result<(), Error> {
    // Do nothing!
    Ok(())
}
