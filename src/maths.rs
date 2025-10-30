use stylus_sdk::alloy_primitives::{U256, U64};

use bobcat_maths::U;

use crate::{error::Error, fees::FEE_SCALING};

macro_rules! add {
    ($x:expr, $y:expr) => {
        c!($x.checked_add($y).ok_or(Error::CheckedAddOverflow))
    };
}

macro_rules! sub {
    ($x:expr, $y:expr) => {
        c!($x.checked_sub($y).ok_or(Error::CheckedSubOverflowD))
    };
}

macro_rules! div {
    ($x:expr, $y:expr) => {
        c!($x.checked_div($y).ok_or(Error::CheckedDivOverflow))
    };
}

#[allow(non_snake_case)]
pub fn dppm_price(x: U256, M1: U256, M2: U256) -> Result<U256, Error> {
    Ok(div!(x * FEE_SCALING, add!(M1, M2)))
}

#[allow(non_snake_case)]
pub fn dppm_shares(M_A: U256, M_B: U256, m: U256, out_of_b: U256) -> Result<U256, Error> {
    // cost + (self.M1 + cost) / (self.M1 + self.M2 + cost) * (self.M2 - self.outofM2)
    // m + ((M_A + m) * (M_B - out_of_b) / ((M_A + M_B) + m))
    Ok(add!(
        m,
        mul_div(add!(M_A, m), sub!(M_B, out_of_b), add!(add!(M_A, M_B), m))?.0
    ))
}

/// Get the payoff for the shares given. This should be the amount of shares
/// the user has.
pub fn dppm_payoff(n: U256) -> Result<U256, Error> {
    Ok(n)
}

pub fn ninetails_shares(shares: U256, t_buy: U64, t_end: U64) -> Result<U256, Error> {
    // shares the user owns
    // t_buy are the number of seconds since the market started
    // t_end is the end of the market
    // shares * ((t_buy - t_end) ^ 2)
    shares
        .checked_mul(U256::from(t_end.wrapping_sub(t_buy)))
        .ok_or(Error::CheckedMulOverflow)
}

/// Ninetails payoff function that only losers can call.
pub fn ninetails_payoff_losers(
    leftovers: U256,
    user_boosted_shares: U256,
    global_boosted_shares: U256,
) -> Result<U256, Error> {
    let refund = mul_div(leftovers, U256::from(3e6 as u32), U256::from(10e6 as u32))?.0;
    Ok(mul_div(user_boosted_shares, refund, global_boosted_shares)?.0)
}

/// Ninetails payoff function that winners can call as a part of the
/// payoff path.
#[allow(non_snake_case)]
pub fn ninetails_payoff_winners(
    leftovers: U256,
    user_boosted_shares: U256,
    outcome_boosted_shares: U256,
    global_boosted_shares: U256,
) -> Result<U256, Error> {
    let boost = mul_div(leftovers, U256::from(7e6 as u32), U256::from(10e6 as u32))?.0;
    let winnings = mul_div(user_boosted_shares, boost, outcome_boosted_shares)?.0;
    let refund = ninetails_payoff_losers(leftovers, user_boosted_shares, global_boosted_shares)?;
    Ok(add!(winnings, refund))
}

pub fn rooti(x: U256, n: u32) -> Result<U256, Error> {
    match U::from(x.to_be_bytes::<32>()).checked_rooti(n) {
        Some(x) => Ok(U256::from_be_slice(&x.0)),
        None => Err(Error::BadRooti),
    }
}

#[test]
fn test_rooti() {
    assert_eq!(U256::from(2), rooti(U256::from(4), 2).unwrap());
}

pub fn mul_div(a: U256, b: U256, denom_and_rem: U256) -> Result<(U256, bool), Error> {
    let a = U::from(a.to_be_bytes::<32>());
    let b = U::from(b.to_be_bytes::<32>());
    let denom_and_rem = U::from(denom_and_rem.to_be_bytes::<32>());
    a.ruint_mul_div(&b, denom_and_rem)
        .ok_or(Error::BadMulDiv)
        .map(|(x, b)| (U256::from_be_slice(&x.0), b))
}

pub fn mul_div_round_up(a: U256, b: U256, denominator: U256) -> Result<U256, Error> {
    let a = U::from(a.to_be_bytes::<32>());
    let b = U::from(b.to_be_bytes::<32>());
    let denominator = U::from(denominator.to_be_bytes::<32>());
    a.ruint_mul_div_round_up(&b, denominator)
        .ok_or(Error::BadMulDiv)
        .map(|x| U256::from_be_slice(&x.0))
}

pub fn calc_fee(x: U256, f: U256) -> Result<U256, Error> {
    if f.is_zero() {
        return Ok(U256::ZERO);
    }
    mul_div_round_up(x, f, FEE_SCALING)
}

pub fn calc_lp_sell_fee(x: U256, f: U256) -> Result<U256, Error> {
    if f.is_zero() {
        return Ok(U256::ZERO);
    }
    let l = x
        .checked_mul(FEE_SCALING)
        .and_then(|x| x.checked_mul(f))
        .ok_or(Error::CheckedMulOverflow)?;
    let r = c!(FEE_SCALING
        .checked_sub(f)
        .ok_or(Error::CheckedSubOverflow(FEE_SCALING, f)));
    Ok(l.checked_div(r)
        .ok_or(Error::CheckedDivOverflow)?
        .div_ceil(FEE_SCALING))
}

#[test]
fn test_calc_lp_sell_fee() {
    let x = U256::from(100e6 as u64);
    assert_eq_u!(2040817, calc_lp_sell_fee(x, U256::from(20)).unwrap());
}

#[test]
fn test_calc_buy_fee() {
    let x = U256::from(500e6 as u64);
    assert_eq_u!(10e6 as u64, calc_fee(x, U256::from(20)).unwrap());
}

#[cfg(all(test, not(target_arch = "wasm32")))]
mod proptesting {
    use super::*;

    use crate::utils::strat_medium_u256;

    use proptest::prelude::*;

    proptest! {
        #[test]
        fn test_mul_div(
            x in strat_medium_u256(),
            y in strat_medium_u256(),
            z in strat_medium_u256()
        ) {
            let c = x.checked_mul(y).and_then(|x| x.checked_div(z));
            prop_assume!(c.is_some());
            assert_eq!(
                c.unwrap(),
                mul_div(x, y, z).unwrap().0
            );
            assert!({
                let a = (x * y) / z;
                let r = mul_div_round_up(x, y, z).unwrap();
                a == r || a == r - U256::from(1)
            })
        }
    }
}
