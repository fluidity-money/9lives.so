
use stylus_sdk::alloy_primitives::U256;

use rust_decimal::{Decimal, MathematicalOps};

use crate::{
    error::Error,
};

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
        c!($x.checked_sub($y).ok_or(Error::CheckedSubOverflow))
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

pub fn rooti(x: U256, n: u32) -> U256 {
    // We need this because Alloy uses floating points code for this.
    if x.is_zero() {
        return U256::ZERO;
    }
    if n == 1 {
        return x;
    }
    let mut z = (x >> (n - 1)) + U256::from(1);
    let mut y = x;
    let n = U256::from(n);
    let n_1 = n - U256::from(1);
    while z < y {
        y = z;
        z = ((x / z.pow(n_1)) + (z * n_1)) / n;
    }
    if y.pow(n) > x {
        y -= U256::from(1);
    }
    y
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
