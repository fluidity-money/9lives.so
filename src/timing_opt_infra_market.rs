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

fn within_two_days(start: u64, cur: u64) -> bool {
    let start = calling_period_start + 172800;
    matches!(current_ts, calling_period_start..start)
}

macro_rules! define_period_checker {
    ($func_name:ident, $when:ident, $from_days:expr, $unset_err:ident, $days:expr) => {
        pub fn $func_name($when: u64, current_ts: u64) -> Result<bool, Error> {
            if $when == 0 {
                return Err(Error::$unset_err);
            }
            let when = $when + ($from_days * 24 * 60 * 60);
            let until = when + ($days * 24 * 60 * 60);
            matches!(current_ts, when..until)
        }
    };
}

define_period_checker!(
    are_we_in_calling_period,
    calling_period_start,
    0,
    CampaignCallEmpty,
    2
);
define_period_checker!(are_we_in_whinging_period, when_called, 0, CalledUnsetCalled, 2);
define_period_checker!(
    are_we_in_predicting_period,
    when_whinged,
    0,
    CalledUnsetWhinged,
    2
);
// We're simultaneously in the sweeping and anything goes period at one
// point.
define_period_checker!(
    are_we_in_sweeping_period,
    when_whinged,
    2,
    CalledUnsetWhinged,
    4
);
define_period_checker!(
    are_we_in_anything_goes_period,
    when_whinged,
    4,
    CalledUnsetWhinged,
    2
);
