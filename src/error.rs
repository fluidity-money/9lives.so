use alloc::vec::Vec;

use stylus_sdk::{abi::internal::EncodableReturnType, alloy_primitives::Address, ArbResult};

use std::{
    convert::Infallible,
    ops::{ControlFlow, FromResidual, Try},
};

#[cfg(feature = "testing")]
use std::backtrace::Backtrace;

#[macro_export]
macro_rules! assert_or {
    ($cond:expr, $err:expr) => {
        if !($cond) {
            Err($err)?;
        }
    };
}

#[derive(Debug)]
#[repr(u8)]
pub enum Error {
    // 0x01
    /// Proxy already created.
    AlreadyConstructed,

    // 0x02
    /// Outcomes must be defined to create Trading.
    MustContainOutcomes,

    // 0x03
    /// Some odds must be set beforehand.
    OddsMustBeSet,

    // 0x04
    /// The number that we're trying to make into a float is too large.
    U256TooLarge,

    // 0x05
    /// The number is too small. Maybe you need to pass in 1e<decimals>.
    TooSmallNumber,

    // 0x06
    /// The number is too big!
    TooBigNumber,

    // 0x07
    /// Somehow, the number became negative!
    NegNumber,

    // 0x08
    /// Longtail had an error, we'll bubble up what happened.
    LongtailError(Vec<u8>),

    // 0x09
    /// A share had an error!
    ShareError(Vec<u8>),

    // 0x0a
    /// ERC20 error on transfer!
    ERC20ErrorTransfer(Address, Vec<u8>),

    // 0x0b
    /// Trading error! Probably during construction.
    TradingError(Vec<u8>),

    // 0x0c
    /// ERC20 unable to unpack a value!
    ERC20UnableToUnpack,

    // 0x0d
    /// ERC20 error! Returned false!
    ERC20ReturnedFalse,

    // 0x0e
    /// You called a trusted function you shouldn't have.
    NotOracle,

    // 0x0f
    /// Done voting!
    DoneVoting,

    // 0x10
    /// The msg.sender isn't a trading contract that the Factory deployed!
    NotTradingContract,

    // 0x11
    /// Tried do a payoff for an outcome that didn't come true!
    NotWinner,

    // 0x12
    /// Negative amount was attempted to be made a uint256!
    NegU256,

    // 0x13
    /// Checked overflow in the pow function!
    CheckedPowOverflow,

    // 0x14
    /// Checked overflow in a multiplication!
    CheckedMulOverflow,

    // 0x15
    /// Checked addition overflowed!
    CheckedAddOverflow,

    // 0x16
    /// Checked subtraction overflowed!
    CheckedSubOverflow,

    // 0x17
    /// Checked division overflowed!
    CheckedDivOverflow,

    // 0x18
    /// Two outcomes only!
    TwoOutcomesOnly,

    // 0x19
    /// Infinity log!
    Infinity,

    // 0x1a
    /// Negative number that was attempted to be converted to U256
    NegativeFixedToUintConv,

    // 0x1b
    /// Unusual amounts (more than 10 million liquidity at first?) were
    /// supplied.
    UnusualAmountCreated,

    // 0x1c
    /// Sqrt function returned None!
    SqrtOpNone,

    // 0x1d
    /// ERC20 error on transfer from!
    ERC20ErrorTransferFrom(Address, Vec<u8>),

    // 0x1e
    /// ERC20 error on permit!
    ERC20ErrorPermit(Address, Vec<u8>),

    // 0x1f
    /// ERC20 error on balanceOf!
    ERC20ErrorBalanceOf(Address, Vec<u8>),

    // 0x20
    /// No shares were burned.
    ZeroShares,

    // 0x21
    /// Camelot had an error, we'll bubble up what happened. UNUSED.
    CamelotError(Vec<u8>),

    // 0x22
    /// DPM you can only set 1!
    BadSeedAmount,

    // 0x23
    /// Error using the locked ARB code!
    LockedARBError(Address, Vec<u8>),

    // 0x24
    /// Error unpacking a U256!
    LockedARBUnableToUnpack,

    // 0x25
    /// The Trading contract was already registered with the
    /// Infrastructure Markets contract!
    AlreadyRegistered,

    // 0x26
    /// The sender is not the factory contract!
    NotFactoryContract,

    // 0x27
    /// The sender is not the infrastructure market!
    NotInfraMarket,

    // 0x28
    /// Infrastructure market has not started yet!
    InfraMarketHasNotStarted,

    // 0x29
    /// User has tried to allocate more than they possibly should to the infra market.
    InfraMarketTooMuchVested,

    // 0x2a
    /// Infrastructure market has expired!
    InfraMarketHasExpired,

    // 0x2b
    /// Error interacting with the lockup contract!
    LockupError(Address, Vec<u8>),

    // 0x2c
    /// The infrastructure market has not expired!
    InfraMarketHasNotExpired,

    // 0x2d
    /// Sweep wasn't called with calldata to reconstruct the winner.
    IncorrectSweepInvocation,

    // 0x2e
    /// User was already targeted by the sweep/they can't be targeted!
    UserAlreadyTargeted,

    // 2f
    /// The window for this market has closed! It's been longer than a week.
    InfraMarketWindowClosed,

    // 0x30
    /// The Trading contract's shutdown function was already called.
    IsShutdown,

    // 0x31
    /// The factory call failed!
    FactoryCallError(Vec<u8>),

    // 0x32
    /// We were unable to unpack the factory call!
    FactoryCallUnableToUnpack,

    // 0x33
    /// The caller is not the factory!
    CallerIsNotFactory,

    // 0x34
    /// The contract is disabled!
    NotEnabled,

    // 0x35
    /// Unable to unpack from a Lockup call!
    LockupUnableToUnpack,

    // 0x36
    /// The victim did not predict incorrectly!
    BadVictim,

    // 0x37
    /// The caller cannot claim the victim's funds (yet?) due to less power.
    VictimCannotClaim,

    // 0x38
    /// The caller is out of vested power to allocate!
    NoVestedPower,

    // 0x39
    /// Tried to call with a zero amount!
    ZeroAmount,

    // 0x3a
    /// Error calling the Infrastructure Market!
    InfraMarketCallError(Vec<u8>),

    // 0x3b
    /// Error creating the NinelivesLockedArb contract!
    NinelivesLockedArbCreateError,

    // 0x3c
    /// The outcome does not exist!
    NonexistentOutcome,

    // 0x3d
    /// Error deploying a contract!
    DeployError,
}

/// Error that will unwrap if it fails instead of propagating to the toplevel.
#[derive(Debug)]
pub struct R<T>(Result<T, Error>);

impl From<Error> for Vec<u8> {
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
        const ERR_INFRA_MARKET_PREAMBLE: [u8; 2] = [0x99, 0x08];

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
            Error::InfraMarketCallError(b) => ext(&ERR_INFRA_MARKET_PREAMBLE, &[&b]),
            v => vec![0x99, 0x90, unsafe { *<*const _>::from(&v).cast::<u8>() }],
        }
    }
}

impl<T> EncodableReturnType for R<T>
where
    T: EncodableReturnType,
{
    fn encode(self) -> ArbResult {
        match self.0 {
            Ok(v) => v.encode(),
            Err(err) => Err(err.into())
        }
    }
}

impl<T> FromResidual<<Self as Try>::Residual> for R<T> {
    #[track_caller]
    fn from_residual(residual: Error) -> Self {
        #[cfg(feature = "testing")]
        {
            let bt = Backtrace::force_capture();
            panic!("err, {residual:?}: {bt}");
        }
        #[cfg(not(feature = "testing"))]
        R(Err(residual))
    }
}

impl<T> FromResidual<Result<Infallible, Error>> for R<T> {
    #[track_caller]
    fn from_residual(residual: Result<Infallible, Error>) -> Self {
        match residual {
            Err(err) => {
                #[cfg(feature = "testing")]
                {
                    let bt = Backtrace::force_capture();
                    panic!("err, {err:?}: {bt}");
                }
                #[cfg(not(feature = "testing"))]
                R(Err(err))
            }
            Ok(_) => unreachable!(),
        }
    }
}

// This behaviour will unwrap instead of propogating to the top level if
// the code is in the "testing" feature mode.
impl<T> Try for R<T> {
    type Output = T;
    type Residual = Error;

    #[track_caller]
    fn from_output(o: Self::Output) -> Self {
        R(Ok(o))
    }

    #[track_caller]
    fn branch(self) -> ControlFlow<Self::Residual, Self::Output> {
        match self.0 {
            Ok(v) => ControlFlow::Continue(v),
            Err(err) => {
                #[cfg(feature = "testing")]
                panic!("unpacking: {:?}", err);
                #[cfg(not(feature = "testing"))]
                ControlFlow::Break(err)
            }
        }
    }
}

impl<T> From<Result<T, Error>> for R<T> {
    fn from(result: Result<T, Error>) -> Self {
        R(result)
    }
}

impl<T> From<R<T>> for Result<T, Error> {
    fn from(result: R<T>) -> Self {
        result.0
    }
}

pub fn ok<T>(v: T) -> R<T> {
    R(Ok(v))
}

pub fn err<T>(v: Error) -> R<T> {
    R(Err(v))
}

impl<T> R<T> {
    pub fn unwrap(self: R<T>) -> T {
        self.0.unwrap()
    }
    pub fn expect(self: R<T>, msg: &str) -> T {
        self.0.expect(msg)
    }
}
