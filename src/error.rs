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
    // Proxy already created.
    #[error("Already constructed")]
    AlreadyConstructed,

    // Outcomes must be defined to create Trading.
    #[error("Must contain outcomes")]
    MustContainOutcomes,

    // Some odds must be set beforehand.
    #[error("Odds must be set")]
    OddsMustBeSet,

    // The number that we're trying to make into a float is too large.
    #[error("U256 is too high")]
    U256TooLarge,

    // The number is too small. Maybe you need to pass in 1e<decimals>.
    #[error("The amount given is too small")]
    TooSmallNumber,
}

impl From<Error> for Vec<u8> {
    // tests return the message
    #[cfg(not(target_arch = "wasm32"))]
    fn from(val: Error) -> Self {
        val.to_string().into()
    }

    #[cfg(target_arch = "wasm32")]
    fn from(val: Error) -> Self {
        let id = unsafe { *<*const _>::from(&val).cast::<u8>() };
        vec![id]
    }
}