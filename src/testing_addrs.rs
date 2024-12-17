#![cfg(not(target_arch = "wasm32"))]

macro_rules! defaults {
    ( $( $name:ident ),+ ) => {
        defaults!(@count 1, $( $name ),+);
    };
    (@count $n:expr, $name:ident, $( $rest:ident ),+) => {
        pub const $name: [u8; 20] = [$n as u8; 20];
        defaults!(@count ($n + 1), $( $rest ),+);
    };
    (@count $n:expr, $name:ident) => {
        pub const $name: [u8; 20] = [$n as u8; 20];
    };
}

defaults! {
    MSG_SENDER,
    CONTRACT,
    FUSDC,
    LONGTAIL,
    STAKED_ARB,
    TESTING_DAO,
    SHARE,
    LOCKUP_CONTRACT,
    LOCKUP_TOKEN,

    ALICE,
    BOB,
    CHARLIE
}
