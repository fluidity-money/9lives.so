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
    /// Proxy already created.
    #[error("Already constructed")]
    AlreadyConstructed,

    /// Outcomes must be defined to create Trading.
    #[error("Must contain outcomes")]
    MustContainOutcomes,

    /// Some odds must be set beforehand.
    #[error("Odds must be set")]
    OddsMustBeSet,

    /// The number that we're trying to make into a float is too large.
    #[error("U256 is too high")]
    U256TooLarge,

    /// The number is too small. Maybe you need to pass in 1e<decimals>.
    #[error("The amount given is too small")]
    TooSmallNumber,

    /// The number is too big!
    #[error("Too big number")]
    TooBigNumber,

    /// Longtail had an error, we'll bubble up what happened.
    #[error("Longtail had an error.")]
    LongtailError(Vec<u8>),

    /// A share had an error!
    #[error("Share had an error.")]
    ShareError(Vec<u8>),

    /// ERC20 error! Bubble up.
    #[error("ERC20 error")]
    ERC20Error(Vec<u8>),

    /// ERC20 error! Returned false!
    #[error("ERC20 returned false")]
    ERC20ReturnedFalse,

    /// You called a trusted function you shouldn't have.
    #[error("Not oracle")]
    NotOracle,

    /// Done voting!
    #[error("Done voting")]
    DoneVoting,

    /// The msg.sender isn't a trading contract that the Factory deployed!
    #[error("Not trading contract")]
    NotTradingContract,
}

impl From<Error> for Vec<u8> {
    #[cfg(not(target_arch = "wasm32"))]
    fn from(val: Error) -> Self {
        val.to_string().into()
    }

    #[cfg(target_arch = "wasm32")]
    fn from(val: Error) -> Self {
        match val {
            // Unpack the Longtail/ERC20 error as-is.
            Error::LongtailError(b) | Error::ERC20Error(b) | Error::ShareError(b) => b.to_vec(),
            // Include a magic byte opening.
            v => vec![0x09, 0x09, 0x09, unsafe {
                *<*const _>::from(&v).cast::<u8>()
            }],
        }
    }
}
