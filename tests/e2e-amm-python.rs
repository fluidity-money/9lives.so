// This test calls the Python code, with internal state mocked
// differently at random. It does this using a separate Python
// harness (amm_pred_harness).

#![cfg(all(feature = "testing", not(target_arch = "wasm32")))]

use std::{
    cmp::*,
    process::{Command, Output},
    str::FromStr,
};

use stylus_sdk::alloy_primitives::U256;

use proptest::prelude::*;

use lib9lives::{immutables::SHARE_DECIMALS_EXP, maths, utils::strat_large_u256};

proptest! {
    #[test]
    fn test_amm_rooti_against_python(l in strat_large_u256(), r in 2u32..10) {
        let c = Command::new("python3")
          .args(["tests/rooti_test.py", &l.to_string(), &r.to_string()])
            .output()
            .unwrap();
         let Output { stdout, stderr, .. } = c;
         if !stderr.is_empty() {
             panic!("python: {}", String::from_utf8(stderr).unwrap());
         }
         let s = String::from_utf8(stdout).unwrap();
         let expected =
             U256::from_str(s.trim())
             .unwrap()
             .checked_div(SHARE_DECIMALS_EXP)
             .unwrap();
         let res = maths::rooti(l, r).unwrap().checked_div(SHARE_DECIMALS_EXP).unwrap();
         let diff = max(expected, res) - min(expected, res);
         assert!(expected / U256::from(1000) >= diff, "diff with pow({l}, 1/{r})");
    }
}
