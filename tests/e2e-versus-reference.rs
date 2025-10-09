#![cfg(all(feature = "trading-backend-dppm", not(target_arch = "wasm32")))]

use proptest::prelude::*;

use rust_decimal::Decimal;

use std::process::{Command, Output};

use lib9lives::maths;

#[allow(non_snake_case)]
#[derive(serde::Deserialize, Debug)]
struct PythonRes {
    shares_purchased: f64,
    price_before_A: f64,
    price_before_B: f64,
    new_M1: f64,
    new_M2: f64,
}

fn is_similar(a: Decimal, b: Decimal) -> bool {
    (a - b).abs() <= a.max(b) * Decimal::new(1, 5)
}

proptest! {
    #[test]
    #[ignore]
    #[allow(non_snake_case)]
    fn test_against_python(
        M1 in 1..100_000_000u64,
        M2 in 1..100_000_000u64,
        N1 in 1..100_000_000u64,
        N2 in 1..100_000_000u64,
        m in 1..100_000_000u64
    ) {
        let c = Command::new("python3")
          .args([
                "tests/reference.py",
                &M1.to_string(),
                &M2.to_string(),
                &N1.to_string(),
                &N2.to_string(),
                &m.to_string()
            ])
            .output()
            .unwrap();
         let Output { stdout, stderr, .. } = c;
         if !stderr.is_empty() {
             panic!("python: {}", String::from_utf8(stderr).unwrap());
         }
         let PythonRes {
             shares_purchased,
             price_before_A,
             price_before_B,
             new_M1,
             new_M2,
             ..
         } = serde_json::from_slice(&stdout).unwrap();
         let val = Decimal::from_f64_retain(shares_purchased);
         // If this is the case, then we've hit a weird value in the Python.
         prop_assume!(val.is_some());
         // If this is the case, then we're not going to bother testing
         // this (it's likely a strange combination of numbers).
         let val = val.unwrap();
         prop_assume!(val > Decimal::from(1));
         // We can also assume some insane numbers won't happen ( we
         // don't have space for most of this).
         prop_assume!(price_before_A > 0.1);
         prop_assume!(price_before_B > 0.1);
         prop_assume!(price_before_A < 1e8);
         prop_assume!(price_before_B < 1e8);
         prop_assume!(new_M1 < 1e8);
         prop_assume!(new_M2 < 1e8);
         assert!(is_similar(
             val,
             maths::dpm_shares(
                 Decimal::from(M1),
                 Decimal::from(M2),
                 Decimal::from(N1),
                 Decimal::from(N2),
                 Decimal::from(m),
             )
             .unwrap()
         ));
    }
}
