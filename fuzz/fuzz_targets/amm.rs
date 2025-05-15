#![no_main]

use lib9lives::{actions::ActionCtor, StorageTrading};

use libfuzzer_sys::fuzz_target;

fuzz_target!(|a: ActionCtor| {/*
    let mut c = StorageTrading::default();
    c.created.set(false);
    let _ = c.ctor((
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
    )); */
});
