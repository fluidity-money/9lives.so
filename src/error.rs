// This code has some weird behaviour to make tracing backtraces easier.
// This in the form of the SHOULD_PANIC code. The user can elect to
// use should_backtrace to set whether unswap should happen instead of
// returning values. This should not be used in a library context
// (outside of this executable).

#[cfg(target_arch = "wasm32")]
use alloc::vec::Vec;

#[allow(unused)]
#[cfg(any(
    not(target_arch = "wasm32"),
    all(target_arch = "wasm32", feature = "harness-stylus-interpreter")
))]
use {
    crate::{
        immutables, testing_addrs,
        utils::{contract_address, msg_sender},
    },
    alloc::{
        borrow::ToOwned,
        format,
        string::{String, ToString},
    },
};

use stylus_sdk::alloy_primitives::{Address, U256, U64};

macro_rules! err_pre {
    ($name:ident, $val:literal) => {
        const $name: [u8; 2] = [0x99, $val];
    };
}

macro_rules! c {
    ($v:expr) => {
        match $v {
            Ok(v) => v,
            Err(_e) => {
                #[allow(unreachable_code)]
                {
                    #[cfg(any(
                        feature = "testing",
                        all(target_arch = "wasm32", feature = "harness-stylus-interpreter")
                    ))]
                    panic!("called `Result::unwrap()` on an `Err` value: {_e:?}");
                    $v?
                }
            }
        }
    };
}

#[macro_export]
macro_rules! assert_eq_u {
    ($left:expr, $right:expr $(,)?) => {{
        assert_eq!(U256::from($left), $right);
    }};
}

err_pre!(ERR_LONGTAIL_PREAMBLE, 0x00);
err_pre!(ERR_ERC20_TRANSFER_PREAMBLE, 0x01);
err_pre!(ERR_SHARE_PREAMBLE, 0x02);
err_pre!(ERR_TRADING_CTOR_PREAMBLE, 0x03);
err_pre!(ERR_ERC20_TRANSFER_FROM_PREAMBLE, 0x04);
err_pre!(ERR_ERC20_PERMIT_PREAMBLE, 0x05);
err_pre!(ERR_ERC20_BALANCE_OF_PREAMBLE, 0x06);
err_pre!(ERR_LOCKED_ARB_PREAMBLE, 0x07);
err_pre!(ERR_FACTORY_PREAMBLE, 0x07);
err_pre!(ERR_INFRA_MARKET_PREAMBLE, 0x08);
err_pre!(ERR_GENERAL_PREAMBLE, 0x09);
err_pre!(ERR_LOCKED_PREAMBLE, 0x0a);
err_pre!(ERR_TRADING_DECIDE_PREAMBLE, 0x0b);
err_pre!(ERR_TRADING_GLOBAL_SHARES_PREAMBLE, 0x0c);
err_pre!(ERR_TRADING_DETAILS_PREAMBLE, 0x0d);
err_pre!(ERR_TRADING_ESCAPE_PREAMBLE, 0x0e);
err_pre!(ERR_TRADING_TIME_ENDING_PREAMBLE, 0x0f);
err_pre!(ERR_TRADING_OUTCOME_LIST_PREAMBLE, 0x10);
err_pre!(ERR_TRADING_IS_DPPM_PREAMBLE, 0x11);
err_pre!(ERR_TRADING_ADD_LIQ, 0x12);
err_pre!(ERR_TRADING_PRICE, 0x13);

// Some testing affordances to make life easier with tracing the source
// of issues.
#[cfg(all(feature = "testing", not(target_arch = "wasm32")))]
mod testing {
    use std::cell::RefCell;

    thread_local! {
        static SHOULD_PANIC: RefCell<bool> = const { RefCell::new(true) };
    }

    pub fn should_panic_f() -> bool {
        SHOULD_PANIC.with(|v| v.clone().into_inner())
    }

    pub fn panic_guard<T>(f: impl FnOnce() -> T) -> T {
        SHOULD_PANIC.with(|v| *v.borrow_mut() = false);
        let r = f();
        SHOULD_PANIC.with(|v| *v.borrow_mut() = true);
        r
    }

    #[macro_export]
    macro_rules! panic_guard {
        ($func:expr) => {
            panic_guard(|| $func)
        };
    }

    #[macro_export]
    macro_rules! panic_guard_eq {
        ($func:expr, $expect:expr) => {
            assert_eq!($expect, $crate::panic_guard!($func).unwrap_err())
        };
    }
}

#[cfg(all(feature = "testing", not(target_arch = "wasm32")))]
pub use testing::*;

#[macro_export]
macro_rules! assert_or {
    ($cond:expr, $err:expr) => {
        if !($cond) {
            Err($err)?;
        }
    };
}

#[derive(PartialEq, Clone)]
#[repr(u8)]
#[cfg_attr(
    any(
        not(target_arch = "wasm32"),
        all(target_arch = "wasm32", feature = "harness-stylus-interpreter")
    ),
    derive(strum::IntoStaticStr, strum::EnumIter)
)]
pub enum Error {
    /// Proxy already created.
    AlreadyConstructed,

    /// Outcomes must be defined to create Trading.
    MustContainOutcomes,

    /// Some odds must be set beforehand.
    OddsMustBeSet,

    /// The number that we're trying to make into a float is too large.
    U256TooLarge,

    /// The number is too small. Maybe you need to pass in 1e<decimals>.
    TooSmallNumber,

    /// The number is too big!
    TooBigNumber,

    /// Somehow, the number became negative!
    NegNumber,

    /// Longtail had an error, we'll bubble up what happened.
    LongtailError(Vec<u8>),

    /// A share had an error!
    ShareError(Vec<u8>),

    /// ERC20 error on transfer!
    ERC20ErrorTransfer(Address, Vec<u8>),

    /// Trading error during ctor! Probably during construction.
    TradingErrorCtor(Vec<u8>),

    /// ERC20 unable to unpack a value!
    ERC20UnableToUnpack,

    /// ERC20 error! Returned false!
    ERC20ReturnedFalse,

    /// You called a trusted function you shouldn't have.
    NotOracle,

    /// Done voting!
    DoneVoting,

    /// The msg.sender isn't a trading contract that the Factory deployed!
    NotTradingContract,

    /// Tried do a payoff for an outcome that didn't come true!
    NotWinner,

    /// Negative amount was attempted to be made a uint256!
    NegU256,

    /// Checked overflow in the pow function!
    CheckedPowOverflow(U256, U256),

    /// Checked overflow in a multiplication!
    CheckedMulOverflow,

    /// Checked addition overflowed!
    CheckedAddOverflow,

    /// Checked subtraction overflowed!
    CheckedSubOverflow(U256, U256),

    /// Checked division overflowed!
    CheckedDivOverflow,

    /// Two outcomes only!
    TwoOutcomesOnly,

    /// Infinity log!
    Infinity,

    /// Negative number that was attempted to be converted to U256
    NegativeFixedToUintConv,

    /// Unusual amounts (more than 10 million liquidity at first?) were
    /// supplied.
    UnusualAmountCreated,

    /// Sqrt function returned None!
    SqrtOpNone,

    /// ERC20 error on transfer from!
    ERC20ErrorTransferFrom(Address, Address, Address, U256),

    /// ERC20 error on permit!
    ERC20ErrorPermit(Address, Vec<u8>),

    /// ERC20 error on balanceOf!
    ERC20ErrorBalanceOf(Address, Vec<u8>),

    /// No shares were burned.
    ZeroShares,

    /// Camelot had an error, we'll bubble up what happened. UNUSED.
    CamelotError(Vec<u8>),

    /// DPPM you can only set 1!
    BadSeedAmount,

    /// Error using the locked ARB code!
    LockedARBError(Address, Vec<u8>),

    /// Error unpacking a U256!
    LockedARBUnableToUnpack,

    /// The Trading contract was already registered with the
    /// Infrastructure Markets contract!
    AlreadyRegistered,

    /// The sender is not the factory contract!
    NotFactoryContract,

    /// The sender is not the infrastructure market!
    NotInfraMarket,

    /// Infrastructure market has not started yet!
    InfraMarketHasNotStarted,

    /// User has tried to allocate more than they possibly should to the infra market.
    InfraMarketTooMuchVested,

    /// Infrastructure market has expired!
    InfraMarketHasExpired,

    /// Error interacting with the lockup contract!
    LockupError(Address, Vec<u8>),

    /// The infrastructure market has not expired!
    NotInsideSweepingPeriod,

    /// Sweep wasn't called with calldata to reconstruct the winner.
    IncorrectSweepInvocation,

    /// User was already targeted by the sweep/they can't be targeted!
    UserAlreadyTargeted,

    /// The window for this market has closed! It's been longer than a week.
    InfraMarketWindowClosed,

    /// The Trading contract's shutdown function was already called.
    IsShutdown,

    /// The factory call failed!
    FactoryCallError(Vec<u8>),

    /// We were unable to unpack the factory call!
    FactoryCallUnableToUnpack,

    /// The caller is not the factory!
    CallerIsNotFactory,

    /// The contract is disabled!
    NotEnabled,

    /// Unable to unpack from a Lockup call!
    LockupUnableToUnpack,

    /// The victim did not predict incorrectly!
    BadVictim,

    /// The caller cannot claim the victim's funds (yet?) due to less power.
    VictimCannotClaim,

    /// The caller is out of vested power to allocate!
    NoVestedPower,

    /// Tried to call with a zero amount!
    ZeroAmount,

    /// Error calling the Infrastructure Market!
    InfraMarketCallError(Vec<u8>),

    /// Error creating the NinelivesLockedArb contract!
    NinelivesLockedArbCreateError,

    /// The outcome does not exist!
    NonexistentOutcome,

    /// Error deploying a contract!
    DeployError(Vec<u8>),

    /// The called field is unset during our check in the timing functions
    CalledTimeUnset,

    /// The whinged time is unset!
    WhingedTimeUnset,

    /// The campaign is not inside the calling period!
    NotInsideCallingPeriod,

    /// Someone already called the outcome!
    CampaignAlreadyCalled,

    /// Predicting hasn't started for this campaign!
    PredictingNotStarted,

    /// The campaign is still in the calling period!
    InCallingPeriod,

    /// Someone whinged, closing is not allowed!
    SomeoneWhinged,

    /// The winner was already declared!
    WinnerAlreadyDeclared,

    /// We're not in the whinging period!
    NotInWhingingPeriod,

    /// The preferred outcome is 0!
    PreferredOutcomeIsZero,

    /// Someone already whinged!
    AlreadyWhinged,

    /// An outcome was duplicated.
    OutcomeDuplicated,

    /// It's not past the deadline for this contract!
    NotPastDeadline,

    /// A zero description was passed!
    ZeroDesc,

    /// A zero trading address was passed!
    ZeroTradingAddr,

    /// This contract was not registered!
    NotRegistered,

    /// This user is not the operator!
    NotOperator,

    /// The trading contract is not set up.
    TradingEmpty,

    /// Unable to unpack a response from the Trading contract.
    TradingUnableToUnpack(Address, Vec<u8>),

    /// Beauty contest had bad outcome calldata submitted to it.
    BeautyContestBadOutcomes,

    /// We're below the three hour buyin for someone to enter the Trading contract!
    BelowThreeHourBuyin,

    /// There is no DAO money to distribute! Perhaps, this was called in error.
    NoDAOMoney,

    /// The call deadline was unset.
    ZeroCallDeadline,

    /// The zero outcome was set, and we can't have that during the call stage.
    InconclusiveAnswerToCall,

    /// We're past the calling period. The escape hatch should be used soon.
    PastCallingDeadline,

    /// We cannot use the escape functionality!
    CannotEscape,

    /// We're not after the whinging period!
    NotAfterWhinging,

    /// We're not in a commitment reveal period!
    NotInCommitReveal(u64, u64),

    /// The commitment reveal wasn't the same!
    CommitNotTheSame,

    /// The user already revealed!
    AlreadyRevealed,

    /// Zero commits aren't allowed, as it should be something set.
    NotAllowedZeroCommit,

    /// Zero balance of ARB is available.
    ZeroBal,

    /// The user's recorded staked ARB balance right now is less than theirs at inception.
    StakedArbUnusual,

    /// It's too early to withdraw from the Lockup contract!
    TooEarlyToWithdraw,

    /// The victim has too low of a balance to have their amount slashed!
    VictimLowBal,

    /// The campaign winner was already set.
    CampaignWinnerSet,

    /// The outcome list is empty!
    OutcomesEmpty,

    /// The epoch submitted for sweeping isn't valid.
    InvalidEpoch,

    /// The pot was already claimed by the user!
    PotAlreadyClaimed,

    /// The campaign had a zero caller!
    CampaignZeroCaller,

    /// The campaign winner is unset!
    WinnerUnset,

    /// Bad winner!
    BadWinner,

    /// The whinger can't whinge about what was called with the same agrument.
    CantWhingeCalled,

    // We're not able to declare since we're not past the period for predicting!
    NotReadyToDeclare,

    // The caller has already declared their commitment!
    AlreadyCommitted,

    // (Deprecated) flag that the DPM was the only supported model.
    DPMOnly,

    // Bad trading configuration!
    BadTradingCtor,

    // This trading instance is nonexistent!
    TradingAddrNonExistent,

    // Error calling approve on a ERC20!
    ERC20Approve,

    // There's been an issue in the build chain and you're accessing a
    // function that shouldn't be able to be used.
    TestingUnreachable,

    // This outcome was zero, and we want to prevent strange behaviour
    // at this point.
    OutcomeIsZero,

    // A negative amount was used in the mint function when the DPPM is in use.
    NegativeAmountWhenDPPM,

    // Only the AMM can sell.
    AMMOnly,

    // Overflow when perfoming a checked negation.
    CheckedNegOverflow,

    // Overflow took place when we tried to convert to a signed equivalent.
    CheckedConvOverflow,

    // Creator tried to provide more than a 10% fee.
    ExcessiveFee,

    // Caller does not have the liquidity to redeem or claim!
    NotEnoughLiquidity,

    // Winner was not decided!
    NotDecided,

    // Someone called the muldiv function with a bad demoninator.
    BadDenominator,

    // We hit the maximum uint256 for a muldiv operation!
    MulDivIsU256Max,

    // Not enough shares were burned by the burn function! Returns the target
    // and the amount burned.
    NotEnoughSharesBurned(U256, U256),

    // No fees are available to claim!
    NoFeesToClaim,

    // Pow overflowed inside the rooti function and became 0.
    PowOverflow,

    // Subtraction underflow with a decimal function.
    CheckedSubOverflowD,

    // We don't let you take out so much liquidity there's only a dollar left!
    CannotRemoveAllLiquidity,

    // Couldn't estimate the amount to sell of shares!
    CouldntEstimateSharesBurn,

    // Someone tried to claim the DAO funds correctly!
    IncorrectDAOClaiming,

    // Call out returned false!
    ReturnedFalse,

    // Not enough liquidity shares were sent to the user after they added
    // liquidity, failing the slippage check.
    NotEnoughLiquidityReturned,

    // Already decided in the internal_decide function!
    AlreadyDecided,

    // The ending timestamp was set to be in the past in the extend_time function.
    EndingInPast,

    // Too much liquidity was taken when the user indicated that shouldn't be the case!
    TooMuchLiquidityTaken,

    /// Checked subtraction overflowed!
    CheckedSubOverflow64(U64, U64),

    /// Trading error during decide!
    TradingErrorDecide(Vec<u8>),

    /// Trading error during geting the trading global shares!
    TradingErrorGlobalShares(Vec<u8>),

    TradingErrorDetails(Vec<u8>),

    TradingErrorEscape(Vec<u8>),

    TradingErrorTimeEnding(Vec<u8>),

    TradingErrorOutcomeList(Vec<u8>),

    TradingErrorIsDppm(Vec<u8>),

    TradingPrice(Vec<u8>),

    TradingErrorAddLiq(Vec<u8>),

    TradingErrorPrice(Vec<u8>),

    /// Someone tried to pass more than zero shares to the payoff function,
    /// when they're the loser!
    ZeroSharesMustBeProvidedForLoser
}

#[cfg(any(
    not(target_arch = "wasm32"),
    all(target_arch = "wasm32", feature = "harness-stylus-interpreter")
))]
pub(crate) fn rename_addr(v: Address) -> String {
    if v == msg_sender() {
        "msg sender".to_string()
    } else if v == contract_address() {
        "contract".to_string()
    } else {
        #[cfg(all(feature = "testing", not(target_arch = "wasm32")))]
        return match v {
            immutables::FUSDC_ADDR => "fusdc".to_string(),
            immutables::LONGTAIL_ADDR => "longtail contract".to_string(),
            immutables::STAKED_ARB_ADDR => "staked arb addr".to_string(),
            immutables::DAO_OP_ADDR => "testing op dao".to_string(),
            immutables::DAO_EARN_ADDR => "testing earn dao".to_string(),
            testing_addrs::SHARE => "share".to_string(),
            testing_addrs::LOCKUP_CONTRACT => "lockup contract".to_string(),
            testing_addrs::LOCKUP_TOKEN => "lockup token".to_string(),
            testing_addrs::ZERO_FOR_MINT_ADDR => "mint addr".to_string(),
            testing_addrs::IVAN => "ivan".to_string(),
            testing_addrs::ERIK => "erik".to_string(),
            testing_addrs::ELI => "eli".to_string(),
            testing_addrs::OGOUS => "ogous".to_string(),
            testing_addrs::PAXIA => "paxia".to_string(),
            testing_addrs::YOEL => "yoel".to_string(),
            _ => {
                if let Some(v) = crate::host::get_addr_expl(v) {
                    return v;
                };
                v.to_string()
            }
        };
        #[cfg(not(all(feature = "testing", not(target_arch = "wasm32"))))]
        return v.to_string();
    }
}

#[test]
#[ignore]
fn test_print_error_table() {
    use prettytable::{
        format::{FormatBuilder, LinePosition, LineSeparator},
        Cell, Row, Table,
    };
    use strum::IntoEnumIterator;
    let mut t = Table::new();
    t.set_format(
        FormatBuilder::new()
            .padding(1, 1)
            .borders('|')
            .separator(LinePosition::Title, LineSeparator::new('-', '|', '|', '|'))
            .column_separator('|')
            .build(),
    );
    t.set_titles(Row::new(vec![
        Cell::new("Error name"),
        Cell::new("Error hex"),
    ]));
    for n in Error::iter() {
        let v: Vec<u8> = n.clone().into();
        t.add_row(Row::new(vec![
            Cell::new(n.into()),
            Cell::new(&format!("0x{}", const_hex::encode(v))),
        ]));
    }
    t.printstd();
}

#[cfg(any(
    not(target_arch = "wasm32"),
    all(target_arch = "wasm32", feature = "harness-stylus-interpreter")
))]
impl core::fmt::Debug for Error {
    fn fmt(&self, f: &mut core::fmt::Formatter<'_>) -> core::fmt::Result {
        let n: &str = self.into();
        write!(
            f,
            "{n}: {}",
            match self {
                Error::ERC20ErrorTransferFrom(addr, from, to, amt) => format!(
                    "{}: {} sending to {}, amt: {amt}",
                    rename_addr(*addr),
                    rename_addr(*from),
                    rename_addr(*to),
                ),
                Error::CheckedSubOverflow(x, y) => format!("sub overflow: {x} - {y}"),
                Error::CheckedPowOverflow(x, y) => format!("pow overflow: pow({x}, {y})"),
                Error::ERC20ErrorTransfer(addr, msg) => format!(
                    "{}: {:?}",
                    rename_addr(*addr),
                    String::from_utf8(msg.clone())
                ),
                Error::DeployError(reason) =>
                    format!("error deploying: {}", String::from_utf8_lossy(reason)),
                Error::TradingUnableToUnpack(addr, b) => format!(
                    "trading unable to unpack from call to {addr}: {}",
                    const_hex::encode(b)
                ),
                Error::NotEnoughSharesBurned(target, burned) =>
                    format!("burn target missed: target {target}, burned: {burned}"),
                _ => "".to_owned(),
            }
        )
    }
}

pub type R<T> = Result<T, Error>;

impl From<Error> for u8 {
    fn from(v: Error) -> Self {
        unsafe { *<*const _>::from(&v).cast::<u8>() }
    }
}

impl From<Error> for Vec<u8> {
    fn from(v: Error) -> Self {
        fn ext(preamble: &[u8], b: &[&[u8]]) -> Vec<u8> {
            let mut x = preamble.to_vec();
            for b in b {
                x.extend(*b);
            }
            x
        }
        fn ext_general(b: &[&[u8]]) -> Vec<u8> {
            ext(&[0x99, 0x09], b)
        }

        match v {
            Error::LongtailError(b) => ext(&ERR_LONGTAIL_PREAMBLE, &[&b]),
            Error::ERC20ErrorTransfer(addr, b) => {
                ext(&ERR_ERC20_TRANSFER_PREAMBLE, &[&b, addr.as_slice()])
            }
            Error::ERC20ErrorTransferFrom(addr, from, to, amt) => ext(
                &ERR_ERC20_TRANSFER_FROM_PREAMBLE,
                &[
                    addr.as_slice(),
                    from.as_slice(),
                    to.as_slice(),
                    &amt.to_be_bytes::<32>(),
                ],
            ),
            Error::ERC20ErrorPermit(addr, b) => {
                ext(&ERR_ERC20_PERMIT_PREAMBLE, &[&b, addr.as_slice()])
            }
            Error::ERC20ErrorBalanceOf(addr, b) => {
                ext(&ERR_ERC20_BALANCE_OF_PREAMBLE, &[&b, addr.as_slice()])
            }
            Error::LockedARBError(addr, b) => ext(&ERR_LOCKED_ARB_PREAMBLE, &[&b, addr.as_slice()]),
            Error::LockupError(addr, b) => ext(&ERR_LOCKED_PREAMBLE, &[addr.as_slice(), &b]),
            Error::ShareError(b) => ext(&ERR_SHARE_PREAMBLE, &[&b]),
            Error::TradingErrorCtor(b) => ext(&ERR_TRADING_CTOR_PREAMBLE, &[&b]),
            Error::TradingErrorDecide(b) => ext(&ERR_TRADING_DECIDE_PREAMBLE, &[&b]),
            Error::TradingErrorGlobalShares(b) => ext(&ERR_TRADING_GLOBAL_SHARES_PREAMBLE, &[&b]),
            Error::TradingErrorDetails(b) => ext(&ERR_TRADING_DETAILS_PREAMBLE, &[&b]),
            Error::TradingErrorEscape(b) => ext(&ERR_TRADING_ESCAPE_PREAMBLE, &[&b]),
            Error::TradingErrorTimeEnding(b) => ext(&ERR_TRADING_TIME_ENDING_PREAMBLE, &[&b]),
            Error::TradingErrorOutcomeList(b) => ext(&ERR_TRADING_OUTCOME_LIST_PREAMBLE, &[&b]),
            Error::TradingErrorIsDppm(b) => ext(&ERR_TRADING_IS_DPPM_PREAMBLE, &[&b]),
            Error::TradingErrorAddLiq(b) => ext(&ERR_TRADING_ADD_LIQ, &[&b]),
            Error::TradingPrice(b) => ext(&ERR_TRADING_PRICE, &[&b]),
            Error::FactoryCallError(b) => ext(&ERR_FACTORY_PREAMBLE, &[&b]),
            Error::InfraMarketCallError(b) => ext(&ERR_INFRA_MARKET_PREAMBLE, &[&b]),
            Error::NotInCommitReveal(whinge_ts, cur_ts) => {
                ext_general(&[&[v.into()], &whinge_ts.to_be_bytes(), &cur_ts.to_be_bytes()])
            }
            Error::TradingUnableToUnpack(addr, b) => {
                ext(&ERR_GENERAL_PREAMBLE, &[addr.as_slice(), &b])
            }
            v => ext(&ERR_GENERAL_PREAMBLE, &[&[v.into()]]),
        }
    }
}
