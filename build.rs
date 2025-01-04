// Simply log the environment variables that were prefixed with SPN_ to a
// artifact file (environment.rs).

use std::{env, fs::OpenOptions, io::Write, path::Path};

fn main() {
    let mut f = OpenOptions::new()
        .create(true)
        .append(true)
        .open(
            &Path::new(&env::var_os("OUT_DIR").expect("OUT_DIR not available"))
                .join("environment.lst"),
        )
        .unwrap();
    for (k, v) in env::vars() {
        if k.starts_with("SPN_") {
            writeln!(f, "{k}={v}").unwrap();
        }
    }
}
