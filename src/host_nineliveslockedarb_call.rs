use std::{cell::RefCell, collections::HashMap};

use crate::error::Error;

use stylus_sdk::alloy_primitives::{Address, U256};

thread_local! {
    static PAST_VOTES: RefCell<HashMap<Address, U256>> = RefCell::new(HashMap::new());
}

pub fn ctor(_token: Address, _owner: Address) -> Result<(), Error> {
    Ok(())
}

pub fn should_points<T>(
    addr: Address,
    amt: U256,
    f: impl FnOnce() -> Result<T, Error>,
) -> Result<T, Error> {
    PAST_VOTES.with(|v| v.borrow_mut().insert(addr, amt));
    let v = f();
    PAST_VOTES.with(|v| v.borrow_mut().insert(addr, U256::ZERO));
    v
}

#[macro_export]
macro_rules! should_points {
    (
        $addr:expr,
        $amt: expr,
        $func:expr
    ) => {
        $crate::host_nineliveslockedarb_call::should_points($addr, $amt, || $func)
    };
}

/// Get the past votes for a address at a point in time.
pub fn get_past_votes(_addr: Address, spender: Address, _timepoint: U256) -> Result<U256, Error> {
    Ok(PAST_VOTES.with(|v| {
        let v = v.borrow();
        *v.get(&spender).unwrap_or(&U256::ZERO)
    }))
}
