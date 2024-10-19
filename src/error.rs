use alloc::vec::Vec;
use thiserror::Error;

#[macro_export]
macro_rules! assert_or {
    ($cond:expr, $err:expr) => {
        if !($cond) {
            Err($err)?; // question mark forces coercion
        }
    };
}

#[derive(Error, Debug)]
#[repr(u8)]
pub enum Error {
    // 0x01
    /// Proxy already created.
    #[error("Already constructed")]
    AlreadyConstructed,

    // 0x02
    /// Outcomes must be defined to create Trading.
    #[error("Must contain outcomes")]
    MustContainOutcomes,

    // 0x03
    /// Some odds must be set beforehand.
    #[error("Odds must be set")]
    OddsMustBeSet,

    // 0x04
    /// The number that we're trying to make into a float is too large.
    #[error("U256 is too high")]
    U256TooLarge,

    // 0x05
    /// The number is too small. Maybe you need to pass in 1e<decimals>.
    #[error("The amount given is too small")]
    TooSmallNumber,

    // 0x06
    /// The number is too big!
    #[error("Too big number")]
    TooBigNumber,

    // 0x07
    /// Somehow, the number became negative!
    #[error("Number is negative")]
    NegNumber,

    // 0x08
    /// Longtail had an error, we'll bubble up what happened.
    #[error("Longtail had an error.")]
    LongtailError(Vec<u8>),

    // 0x0a
    /// A share had an error!
    #[error("Share had an error.")]
    ShareError(Vec<u8>),

    // 0x0b
    /// ERC20 error! Bubble up.
    #[error("ERC20 error")]
    ERC20Error(Vec<u8>),

    // 0x0c
    /// Trading error! Probably during construction.
    #[error("Trading error")]
    TradingError(Vec<u8>),

    // 0x0d
    /// ERC20 unable to unpack a value!
    #[error("ERC20 unable to unpack")]
    ERC20UnableToUnpack,

    // 0x0e
    /// ERC20 error! Returned false!
    #[error("ERC20 returned false")]
    ERC20ReturnedFalse,

    // 0x0d
    /// You called a trusted function you shouldn't have.
    #[error("Not oracle")]
    NotOracle,

    // 0x0e
    /// Done voting!
    #[error("Done voting")]
    DoneVoting,

    // 0x0f
    /// The msg.sender isn't a trading contract that the Factory deployed!
    #[error("Not trading contract")]
    NotTradingContract,

    // 0x10
    /// Tried do a payoff for an outcome that didn't come true!
    #[error("Not winner!")]
    NotWinner,

    // 0x11
    /// Negative amount was attempted to be made a uint256!
    #[error("Negative amount to uint256")]
    NegU256,

    // 0x12
    /// Checked overflow in the pow function!
    #[error("Checked pow overflow")]
    CheckedPowOverflow,

    // 0x13
    /// Checked overflow in a multiplication!
    #[error("Checked mul overflow")]
    CheckedMulOverflow,

    // 0x14
    /// Checked addition overflowed!
    #[error("Checked add overflow")]
    CheckedAddOverflow,

    // 0x15
    /// Checked subtraction overflowed!
    #[error("Checked sub overflow")]
    CheckedSubOverflow,

    // 0x16
    /// Checked division overflowed!
    #[error("Checked div overflow")]
    CheckedDivOverflow,

    // 0x17
    /// Two outcomes only!
    #[error("Two outcomes only")]
    TwoOutcomesOnly,

    // 0x18
    /// Infinity log!
    #[error("Infinity")]
    Infinity,

    // 0x19
    /// Negative number that was attempted to be converted to U256
    #[error("Negative number")]
    NegativeFixedToUintConv,

    // 0x1a
    /// Unusual amounts (more than 10 million liquidity at first?) were
    /// supplied.
    #[error("Unusual amount supplied at first")]
    UnusualAmountCreated,

    // 0x1b
    /// Sqrt function returned None!
    #[error("Sqrt function returned none")]
    SqrtOpNone
}

impl From<Error> for Vec<u8> {
    #[cfg(not(target_arch = "wasm32"))]
    fn from(val: Error) -> Self {
        val.to_string().into()
    }

    #[cfg(target_arch = "wasm32")]
    fn from(val: Error) -> Self {
        fn ext(preamble: [u8; 2], b: Vec<u8>) -> Vec<u8> {
            let mut x = preamble.to_vec();
            x.extend(b);
            x
        }

        const ERR_LONGTAIL_PREAMBLE: [u8; 2] = [0x99, 0x00];
        const ERR_ERC20_PREAMBLE: [u8; 2] = [0x99, 0x01];
        const ERR_SHARE_PREAMBLE: [u8; 2] = [0x99, 0x02];
        const ERR_TRADING_PREAMBLE: [u8; 2] = [0x99, 0x03];

        match val {
            Error::LongtailError(b) => ext(ERR_LONGTAIL_PREAMBLE, b),
            Error::ERC20Error(b) => ext(ERR_ERC20_PREAMBLE, b),
            Error::ShareError(b) => ext(ERR_SHARE_PREAMBLE, b),
            Error::TradingError(b) => ext(ERR_TRADING_PREAMBLE, b),
            v => vec![0x99, 0x90, unsafe { *<*const _>::from(&v).cast::<u8>() }],
        }
    }
}
