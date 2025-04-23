#![no_main]

use lib9lives::StorageTrading;

use libfuzzer_sys::fuzz_target;

use stylus_sdk::alloy_primitives::{Address, FixedBytes};

use arbitrary::{Arbitrary, Unstructured};

#[derive(Arbitrary, Debug, PartialEq)]
struct Ctor {
    outcomes: Vec<BFB<8>>,
    oracle: BAddress,
    time_start: u64,
    time_ending: u64,
    fee_recipient: BAddress,
    share_impl: BAddress,
    should_buffer_time: bool,
    fee_creator: u64,
    fee_lp: u64,
    fee_minter: u64,
}

#[derive(Arbitrary, Debug, PartialEq)]
struct A([u8; 20]);

#[derive(Debug, PartialEq)]
struct BAddress(Address);

impl<'a> Arbitrary<'a> for BAddress {
    fn arbitrary(u: &mut Unstructured<'a>) -> arbitrary::Result<Self> {
        Ok(BAddress(Address::new(A::arbitrary(u)?.0)))
    }
}

#[derive(Arbitrary, Debug, PartialEq)]
struct B<const U: usize>([u8; U]);

#[derive(Debug, PartialEq)]
struct BFB<const U: usize>(FixedBytes<U>);

impl<'a, const U: usize> Arbitrary<'a> for BFB<U> {
    fn arbitrary(u: &mut Unstructured<'a>) -> arbitrary::Result<Self> {
        Ok(BFB::<U>(FixedBytes::<U>::new(B::arbitrary(u)?.0)))
    }
}

fuzz_target!(|a: Ctor| {
    let mut c = StorageTrading::default();
    c.created.set(false);
    let _ = c.ctor(
        a.outcomes.into_iter().map(|x| x.0).collect::<Vec<_>>(),
        a.oracle.0,
        a.time_start,
        a.time_ending,
        a.fee_recipient.0,
        a.share_impl.0,
        a.should_buffer_time,
        a.fee_creator,
        a.fee_lp,
        a.fee_minter,
    );
});
