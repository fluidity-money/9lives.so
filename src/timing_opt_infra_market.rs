use stylus_sdk::alloy_primitives::U64;

use crate::error::Error;

/*
+--------------+--------------+--------------+---------------+----------------+------------------+
| Calling      | Whinging     | Predicting   | Sweeping      | Anything       | Claiming         |
| Period (2d)  | Period (2d)  | Period (2d)  | Period (4d)   | Goes (2d) +    | Ends             |
|              |              |              |               | Sweeping       |                  |
|              |              |              |               | Period         |                  |
+--------------+--------------+--------------+---------------+----------------+------------------+
Day 1-2        Day 3-4        Day 5-6        Day 7-11        Day 9-10         Day 11             |
+--------------+--------------+--------------+---------------+----------------+------------------+
*/

macro_rules! define_period_checker {
    ($func_name:ident, $when:ident, $from_days:expr, $unset_err:ident, $days:expr) => {
        pub fn $func_name($when: U64, current_ts: u64) -> Result<bool, Error> {
            if $when.is_zero() {
                return Err(Error::$unset_err);
            }
            let when = u64::from_le_bytes($when.to_le_bytes()) + ($from_days * 24 * 60 * 60);
            let until = when + ($days * 24 * 60 * 60);
            Ok(when >= current_ts && when <= until)
        }
    };
}

// A week, the time that we should freeze funds for in the lockup functionality.
pub const A_WEEK_SECS: u64 = 7 * 24 * 60 * 60;

define_period_checker!(
    are_we_in_calling_period,
    calling_period_start,
    0,
    CalledTimeUnset,
    2
);
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
// We're simultaneously in the sweeping and anything goes period at one
// point.
define_period_checker!(
    are_we_in_sweeping_period,
    when_whinged,
    2,
    WhingedTimeUnset,
    4
);
define_period_checker!(
    are_we_in_anything_goes_period,
    when_whinged,
    4,
    WhingedTimeUnset,
    2
);