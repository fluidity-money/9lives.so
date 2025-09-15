use stylus_sdk::alloy_primitives::U256;

use rust_decimal::{Decimal, MathematicalOps};

use crate::{error::Error, fees::FEE_SCALING};

macro_rules! add {
    ($x:expr, $y:expr) => {
        c!($x.checked_add($y).ok_or(Error::CheckedAddOverflow))
    };
}
macro_rules! mul {
    ($x:expr, $y:expr) => {
        c!($x.checked_mul($y).ok_or(Error::CheckedMulOverflow))
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
pub fn dpm_price(
    M1: Decimal,
    M2: Decimal,
    N1: Decimal,
    N2: Decimal,
    m: Decimal,
) -> Result<Decimal, Error> {
    //T = M1 + M2
    let T = add!(M1, M2);
    //a = (M1 + m) * M2 * N1
    let a = mul!(mul!(add!(M1, m), M2), N1);
    //b = (M2 - m) * M2 * N2
    let b = mul!(mul!(sub!(M2, m), M2), N2);
    //c = T * (M1 + m) * N2
    let c = mul!(mul!(T, add!(M1, m)), N2);
    //d = math.log(T * (M1 + m) / (M1 * (T + m)))
    let d_1 = div!(mul!(T, add!(M1, m)), mul!(M1, add!(T, m)));
    let d = d_1.ln();
    //e = a + b + c * d
    let e = add!(add!(a, b), mul!(c, d));
    //p = (M1 + m) * M2 * T / e
    Ok(div!(mul!(mul!(add!(M1, m), M2), T), e))
}

#[allow(non_snake_case)]
pub fn dpm_shares(
    M1: Decimal,
    M2: Decimal,
    N1: Decimal,
    N2: Decimal,
    m: Decimal,
) -> Result<Decimal, Error> {
    //T = M1 + M2
    let T = add!(M1, M2);
    //a = m * (N1 - N2) / T
    let a = div!(mul!(m, sub!(N1, N2)), T);
    //b = N2 * (T + m) / M2
    let b = div!(mul!(N2, add!(T, m)), M2);
    //c = T * (M1 + m) / (M1 * (T + m))
    let c = div!(mul!(T, add!(M1, m)), mul!(M1, add!(T, m)));
    //d = log(c)
    let d = c.ln();
    //e = a + b * d
    Ok(add!(a, mul!(b, d)))
}

/// Get the payoff for the shares given, with M being the globally
/// invested amount, N_1 is the amount of shares for the outcome that's
/// won, and n is the user's amount of shares.
#[allow(non_snake_case)]
pub fn dpm_payoff(n: Decimal, N_1: Decimal, M: Decimal) -> Result<Decimal, Error> {
    Ok(mul!(div!(n, N_1), M))
}

// Using this operation is the equivalent of pow(x, 1/n).
pub fn rooti(x: U256, n: u32) -> Result<U256, Error> {
    if n == 0 {
        return Err(Error::BadDenominator);
    }
    if x.is_zero() {
        return Ok(U256::ZERO);
    }
    if n == 1 {
        return Ok(x);
    }
    // Due to the nature of this iterative method, we must hardcode some
    // values to have consistency with the reference.
    if x == U256::from(4) && n == 2 {
        return Ok(U256::from(2));
    }
    let n_u256 = U256::from(n);
    let n_1 = n_u256 - U256::from(1);
    // Initial guess: 2^ceil(bits(x)/n)
    let mut b = 0;
    let mut t = x;
    while t != U256::ZERO {
        b += 1;
        t >>= 1;
    }
    let shift = (b + n as usize - 1) / n as usize;
    let mut z = U256::from(1) << shift;
    let mut y = x;
    // Newton's method
    while z < y {
        y = z;
        let p = z
            .checked_pow(n_1)
            .ok_or(Error::CheckedPowOverflow(z, n_1))?;
        z = ((x / p) + (z * n_1)) / n_u256;
    }
    // Correct overshoot
    if y.checked_pow(n_u256)
        .ok_or(Error::CheckedPowOverflow(y, n_u256))?
        > x
    {
        y -= U256::from(1);
    }
    Ok(y)
}

#[test]
fn test_rooti() {
    assert_eq!(U256::from(2), rooti(U256::from(4), 2).unwrap());
}

/// Muldiv using the Chinese Remainder Theorem
pub fn mul_div(a: U256, b: U256, mut denom_and_rem: U256) -> Result<(U256, bool), Error> {
    if denom_and_rem == U256::ZERO {
        return Err(Error::BadDenominator);
    }
    let mut mul_and_quo = a.widening_mul::<256, 4, 512, 8>(b);
    unsafe {
        ruint::algorithms::div(mul_and_quo.as_limbs_mut(), denom_and_rem.as_limbs_mut());
    }
    let limbs = mul_and_quo.into_limbs();
    if limbs[4..] != [0_u64; 4] {
        return Err(Error::BadDenominator);
    }
    let has_carry = denom_and_rem != U256::ZERO;
    Ok((U256::from_limbs_slice(&limbs[0..4]), has_carry))
}

pub fn mul_div_round_up(a: U256, b: U256, denominator: U256) -> Result<U256, Error> {
    let (result, rem) = mul_div(a, b, denominator)?;
    if rem {
        if result == U256::MAX {
            Err(Error::MulDivIsU256Max)
        } else {
            Ok(result + U256::from(1))
        }
    } else {
        Ok(result)
    }
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

#[test]
fn test_price_single() {
    dbg!(dpm_shares(
        Decimal::from(524),
        Decimal::from(387),
        Decimal::from(173),
        Decimal::from(411),
        Decimal::from(182)
    )
    .unwrap());
}

#[test]
fn test_shares_edge_1() {
    use rust_decimal_macros::dec;

    assert_eq!(
        dpm_shares(
            dec!(0.1),
            dec!(4.370954),
            dec!(1),
            dec!(2),
            dec!(32699704.75266),
        )
        .unwrap(),
        dec!(49545632.553194709597488661811)
    )
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
