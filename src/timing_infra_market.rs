use stylus_sdk::alloy_primitives::U64;

use crate::error::Error;

/*
+--------------+--------------+-------------------+----------+
| Whinging     | Predicting   | Commitment reveal | Sweeping |
| Period (2d)  | Period (2d)  | Period (2d)       | Period   |
|              |              |                   |          |
|              |              |                   |          |
+--------------+--------------+-------------------+----------+
| Day 1-2      | Day 3-4      | Day 5-6     ␣     | Day 7+   |
+--------------+--------------+-------------------+----------+
*/

#[repr(C)]
#[derive(Debug)]
pub enum InfraMarketState {
    Callable,
    Closable,
    Whinging,
    Predicting,
    Revealing,
    Declarable,
    Sweeping,
    Closed,
}

impl From<InfraMarketState> for u8 {
    fn from(v: InfraMarketState) -> Self {
        v as u8
    }
}

macro_rules! define_period_checker {
    ($func_name:ident, $when:ident, $from_days:expr, $unset_err:ident, $days:expr) => {
        pub fn $func_name($when: U64, current_ts: u64) -> Result<bool, Error> {
            if $when.is_zero() {
                return Err(Error::$unset_err);
            }
            let when = u64::from_be_bytes($when.to_be_bytes()) + ($from_days * 24 * 60 * 60);
            let until = when + ($days * 24 * 60 * 60);
            Ok(current_ts >= when && current_ts <= until)
        }
    };
}

// A week, the time that we should freeze funds for in the lockup functionality.
pub const A_WEEK_SECS: u64 = 7 * 24 * 60 * 60;

define_period_checker!(
    are_we_in_whinging_period,
    when_called,
    0,
    CalledTimeUnset,
    2
);
define_period_checker!(
    are_we_in_predicting_period,
    when_whinged,
    0,
    WhingedTimeUnset,
    2
);
define_period_checker!(
    are_we_in_commitment_reveal_period,
    when_whinged,
    2,
    WhingedTimeUnset,
    2
);

pub const TWO_DAYS: u64 = 2 * 24 * 60 * 60;
pub const FOUR_DAYS: u64 = 4 * 24 * 60 * 60;

pub fn are_we_after_whinging_period(whinged_ts: U64, ts: u64) -> Result<bool, Error> {
    if whinged_ts.is_zero() {
        return Err(Error::WhingedTimeUnset);
    }
    Ok(ts > u64::from_be_bytes(whinged_ts.to_be_bytes()) + TWO_DAYS)
}

#[cfg(all(test, not(target_arch = "wasm32")))]
mod test {
    use super::*;
    use proptest::prelude::*;

    proptest! {
        #[test]
        fn test_are_we_in_two_week_period(start in 1..u64::MAX, secs in 1..u64::MAX) {
            let start = U64::from(start);
            let two_weeks = U64::from(1209600);
            let secs_ = U64::from(secs);
            let should_pass = secs_ > start && two_weeks > secs_ - start;
            let calling_period = are_we_in_whinging_period(start, secs).unwrap();
            assert!(
                if should_pass { calling_period } else { !calling_period },
                "start: {start}, secs: {secs_}, err: {calling_period:?}"
            );
        }
    }
}
