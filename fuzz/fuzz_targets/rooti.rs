#![no_main]

use lib9lives::maths;

use stylus_sdk::alloy_primitives::U256;

use libfuzzer_sys::{arbitrary, fuzz_target};

use arbitrary::{Arbitrary, Unstructured};

#[derive(Clone, Debug, PartialEq)]
struct Test {
    x: U256,
    y: u32,
}

impl<'a> Arbitrary<'a> for Test {
    fn arbitrary(u: &mut Unstructured<'a>) -> arbitrary::Result<Self> {
        Ok(Test {
            x: U256::from(u128::arbitrary(u)?),
            y: u.int_in_range(1..=10)?,
        })
    }
}

fuzz_target!(|t: Test| {
    let Test { x, y } = t;
    let r = maths::rooti(x, y).unwrap();
    let y = U256::from(y);
    assert!(r.pow(y) <= x, "r^{} = {} > {}", y, r.pow(y), x);
    assert!(
        (r + U256::from(1)).pow(y) > x,
        "(r+1)^{} = {} ≤ {}",
        y,
        (r + U256::from(1)).pow(y),
        x
    );
});
