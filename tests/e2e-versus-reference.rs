#![cfg(not(target_arch = "wasm32"))]

use proptest::prelude::*;

use std::process::{Command, Output};

//use lib9lives::maths;

#[derive(serde::Deserialize, Debug)]
struct PythonRes {
    outcome: String,
    cost: f64,
    shares_purchased: f64
}

proptest! {
    #[test]
    fn test_against_python(
        M1 in any::<u64>(),
        M2 in any::<u64>(),
        N1 in any::<u64>(),
        N2 in any::<u64>(),
        m in any::<u64>()
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
         let Output { stderr, stdout, .. } = c;
         if !stderr.is_empty() {
             panic!("python: {}", String::from_utf8(stderr).unwrap());
         }
         eprintln!("{}", String::from_utf8(stdout).unwrap());
    }
}
