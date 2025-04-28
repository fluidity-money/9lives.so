
use stylus_sdk::alloy_primitives::Address;

macro_rules! defaults {
    ( $( $name:ident ),+ ) => {
        defaults!(@count 1, $( $name ),+);
    };
    (@count $n:expr, $name:ident, $( $rest:ident ),+) => {
        pub const $name: Address = Address::new([$n as u8; 20]);
        defaults!(@count ($n + 1), $( $rest ),+);
    };
    (@count $n:expr, $name:ident) => {
        pub const $name: Address = Address::new([$n as u8; 20]);
    };
}

defaults! {
    MSG_SENDER,
    CONTRACT,
    FUSDC,
    LONGTAIL,
    STAKED_ARB,
    DAO,
    SHARE,
    LOCKUP_CONTRACT,
    LOCKUP_TOKEN,
    ZERO_FOR_MINT_ADDR,

    IVAN,
    ERIK,
    ELI,
    OGOUS,
    PAXIA,
    YOEL,
    MARKO
}

pub const TESTING_ADDRS: [Address; 16] = [
    MSG_SENDER,
    CONTRACT,
    FUSDC,
    LONGTAIL,
    STAKED_ARB,
    DAO,
    SHARE,
    LOCKUP_CONTRACT,
    LOCKUP_TOKEN,
    // This is used to denominate a mint/burn that's taken place, and is
    // treated specially by the transfer functions.
    ZERO_FOR_MINT_ADDR,

    IVAN,
    ERIK,
    ELI,
    OGOUS,
    PAXIA,
    YOEL
];
