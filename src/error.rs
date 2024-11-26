use alloc::vec::Vec;
use thiserror::Error;

use stylus_sdk::alloy_primitives::Address;

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

    // 0x09
    /// A share had an error!
    #[error("Share had an error.")]
    ShareError(Vec<u8>),

    // 0x0a
    /// ERC20 error on transfer!
    #[error("ERC20 error on transfer")]
    ERC20ErrorTransfer(Address, Vec<u8>),

    // 0x0b
    /// Trading error! Probably during construction.
    #[error("Trading error")]
    TradingError(Vec<u8>),

    // 0x0c
    /// ERC20 unable to unpack a value!
    #[error("ERC20 unable to unpack")]
    ERC20UnableToUnpack,

    // 0x0d
    /// ERC20 error! Returned false!
    #[error("ERC20 returned false")]
    ERC20ReturnedFalse,

    // 0x0e
    /// You called a trusted function you shouldn't have.
    #[error("Not oracle")]
    NotOracle,

    // 0x0f
    /// Done voting!
    #[error("Done voting")]
    DoneVoting,

    // 0x10
    /// The msg.sender isn't a trading contract that the Factory deployed!
    #[error("Not trading contract")]
    NotTradingContract,

    // 0x11
    /// Tried do a payoff for an outcome that didn't come true!
    #[error("Not winner!")]
    NotWinner,

    // 0x12
    /// Negative amount was attempted to be made a uint256!
    #[error("Negative amount to uint256")]
    NegU256,

    // 0x13
    /// Checked overflow in the pow function!
    #[error("Checked pow overflow")]
    CheckedPowOverflow,

    // 0x14
    /// Checked overflow in a multiplication!
    #[error("Checked mul overflow")]
    CheckedMulOverflow,

    // 0x15
    /// Checked addition overflowed!
    #[error("Checked add overflow")]
    CheckedAddOverflow,

    // 0x16
    /// Checked subtraction overflowed!
    #[error("Checked sub overflow")]
    CheckedSubOverflow,

    // 0x17
    /// Checked division overflowed!
    #[error("Checked div overflow")]
    CheckedDivOverflow,

    // 0x18
    /// Two outcomes only!
    #[error("Two outcomes only")]
    TwoOutcomesOnly,

    // 0x19
    /// Infinity log!
    #[error("Infinity")]
    Infinity,

    // 0x1a
    /// Negative number that was attempted to be converted to U256
    #[error("Negative number")]
    NegativeFixedToUintConv,

    // 0x1b
    /// Unusual amounts (more than 10 million liquidity at first?) were
    /// supplied.
    #[error("Unusual amount supplied at first")]
    UnusualAmountCreated,

    // 0x1c
    /// Sqrt function returned None!
    #[error("Sqrt function returned none")]
    SqrtOpNone,

    // 0x1d
    /// ERC20 error on transfer from!
    #[error("ERC20 error on transfer")]
    ERC20ErrorTransferFrom(Address, Vec<u8>),

    // 0x1e
    /// ERC20 error on permit!
    #[error("ERC20 error on permit")]
    ERC20ErrorPermit(Address, Vec<u8>),

    // 0x1f
    /// ERC20 error on balanceOf!
    #[error("ERC20 error on balanceOf")]
    ERC20ErrorBalanceOf(Address, Vec<u8>),

    // 0x20
    /// No shares were burned.
    #[error("No shares were burned!")]
    ZeroShares,

    // 0x21
    /// Camelot had an error, we'll bubble up what happened. UNUSED.
    #[error("Camelot had an error.")]
    CamelotError(Vec<u8>),

    // 0x22
    /// DPM you can only set 1!
    #[error("DPM must be 1e6")]
    BadSeedAmount,

    // 0x23
    /// Error using the locked ARB code!
    #[error("Locked ARB error")]
    LockedARBError(Address, Vec<u8>),

    // 0x24
    /// Error unpacking a U256!
    #[error("Error unpacking ARB!")]
    LockedARBUnableToUnpack,

    // 0x25
    /// The Trading contract was already registered with the
    /// Infrastructure Markets contract!
    #[error("Already registered with Infrastructure Markets!")]
    AlreadyRegistered,

    // 0x26
    /// The sender is not the factory contract!
    #[error("Not factory contract")]
    NotFactoryContract,

    // 0x27
    /// The sender is not the infrastructure market!
    #[error("Not infrastructure market")]
    NotInfraMarket,

    // 0x28
    /// Infrastructure market has not started yet!
    #[error("Infrastructure market has not started!")]
    InfraMarketHasNotStarted,

    // 0x29
    /// User has tried to allocate more than they possibly should to the infra market.
    #[error("Infrastructure market too much vested!")]
    InfraMarketTooMuchVested,

    // 0x2a
    /// Infrastructure market has expired!
    #[error("Infrastructure market has expired!")]
    InfraMarketHasExpired,

    // 0x2b
    /// Error interacting with the lockup contract!
    #[error("Lockup contract error!")]
    LockupError(Address, Vec<u8>),

    // 0x2c
    /// The infrastructure market has not expired!
    #[error("Infrastructure market has not expired yet!")]
    InfraMarketHasNotExpired,

    // 0x2d
    /// Sweep wasn't called with calldata to reconstruct the winner.
    #[error("Incorrect sweep invocation")]
    IncorrectSweepInvocation,

    // 0x2e
    /// User was already targeted by the sweep/they can't be targeted!
    #[error("User already targeted by sweep")]
    UserAlreadyTargeted,

    // 2f
    /// The window for this market has closed! It's been longer than a week.
    #[error("Infrastructure market window has closed!")]
    InfraMarketWindowClosed,

    // 0x30
    /// The Trading contract's shutdown function was already called.
    #[error("Trading is shutdown!")]
    IsShutdown,

    // 0x31
    /// The factory call failed!
    #[error("Factory call failed!")]
    FactoryCallError(Vec<u8>),

    // 0x32
    /// We were unable to unpack the factory call!
    #[error("Factory call unable to unpack!")]
    FactoryCallUnableToUnpack,

    // 0x33
    /// The caller is not the factory!
    #[error("Caller is not factory")]
    CallerIsNotFactory,
}

impl From<Error> for Vec<u8> {
    #[cfg(not(target_arch = "wasm32"))]
    fn from(val: Error) -> Self {
        val.to_string().into()
    }

    #[cfg(target_arch = "wasm32")]
    fn from(val: Error) -> Self {
        fn ext(preamble: &[u8], b: &[&[u8]]) -> Vec<u8> {
            let mut x = preamble.to_vec();
            for b in b {
                x.extend(*b);
            }
            x
        }

        const ERR_LONGTAIL_PREAMBLE: [u8; 2] = [0x99, 0x00];
        const ERR_ERC20_TRANSFER_PREAMBLE: [u8; 2] = [0x99, 0x01];
        const ERR_SHARE_PREAMBLE: [u8; 2] = [0x99, 0x02];
        const ERR_TRADING_PREAMBLE: [u8; 2] = [0x99, 0x02];
        const ERR_ERC20_TRANSFER_FROM_PREAMBLE: [u8; 2] = [0x99, 0x04];
        const ERR_ERC20_PERMIT_PREAMBLE: [u8; 2] = [0x99, 0x05];
        const ERR_ERC20_BALANCE_OF_PREAMBLE: [u8; 2] = [0x99, 0x06];
        const ERR_LOCKED_ARB_PREAMBLE: [u8; 2] = [0x99, 0x07];
        const ERR_FACTORY_PREAMBLE: [u8; 2] = [0x99, 0x07];

        match val {
            Error::LongtailError(b) => ext(&ERR_LONGTAIL_PREAMBLE, &[&b]),
            Error::ERC20ErrorTransfer(addr, b) => {
                ext(&ERR_ERC20_TRANSFER_PREAMBLE, &[&b, addr.as_slice()])
            }
            Error::ERC20ErrorTransferFrom(addr, b) => {
                ext(&ERR_ERC20_TRANSFER_FROM_PREAMBLE, &[&b, addr.as_slice()])
            }
            Error::ERC20ErrorPermit(addr, b) => {
                ext(&ERR_ERC20_PERMIT_PREAMBLE, &[&b, addr.as_slice()])
            }
            Error::ERC20ErrorBalanceOf(addr, b) => {
                ext(&ERR_ERC20_BALANCE_OF_PREAMBLE, &[&b, addr.as_slice()])
            }
            Error::LockedARBError(addr, b) => ext(&ERR_LOCKED_ARB_PREAMBLE, &[&b, addr.as_slice()]),
            Error::ShareError(b) => ext(&ERR_SHARE_PREAMBLE, &[&b]),
            Error::TradingError(b) => ext(&ERR_TRADING_PREAMBLE, &[&b]),
            Error::FactoryCallError(b) => ext(&ERR_FACTORY_PREAMBLE, &[&b]),
            v => vec![0x99, 0x90, unsafe { *<*const _>::from(&v).cast::<u8>() }],
        }
    }
}
