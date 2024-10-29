use stylus_sdk::alloy_primitives::U256;

use rust_decimal::{Decimal, MathematicalOps};

use crate::error::Error;

fn add(x: Decimal, y: Decimal) -> Result<Decimal, Error> {
    x.checked_add(y).ok_or(Error::CheckedAddOverflow)
}
fn mul(x: Decimal, y: Decimal) -> Result<Decimal, Error> {
    x.checked_mul(y).ok_or(Error::CheckedMulOverflow)
}
fn sub(x: Decimal, y: Decimal) -> Result<Decimal, Error> {
    x.checked_sub(y).ok_or(Error::CheckedSubOverflow)
}
fn div(x: Decimal, y: Decimal) -> Result<Decimal, Error> {
    x.checked_div(y).ok_or(Error::CheckedDivOverflow)
}

#[allow(non_snake_case)]
pub fn price(
    M1: Decimal,
    M2: Decimal,
    N1: Decimal,
    N2: Decimal,
    m: Decimal,
) -> Result<Decimal, Error> {
    //T = M1 + M2
    let T = add(M1, M2)?;
    //a = (M1 + m) * M2 * N1
    let a = mul(mul(add(M1, m)?, M2)?, N1)?;
    //b = (M2 - m) * M2 * N2
    let b = mul(mul(sub(M2, m)?, M2)?, N2)?;
    //c = T * (M1 + m) * N2
    let c = mul(mul(T, add(M1, m)?)?, N2)?;
    //d = math.log(T * (M1 + m) / (M1 * (T + m)))
    let d_1 = div(mul(T, add(M1, m)?)?, mul(M1, add(T, m)?)?)?;
    let d = d_1.ln();
    //e = a + b + c * d
    let e = add(add(a, b)?, mul(c, d)?)?;
    //p = (M1 + m) * M2 * T / e
    div(mul(mul(add(M1, m)?, M2)?, T)?, e)
}

#[allow(non_snake_case)]
pub fn shares(
    M1: Decimal,
    M2: Decimal,
    N1: Decimal,
    N2: Decimal,
    m: Decimal,
) -> Result<Decimal, Error> {
    //T = M1 + M2
    let T = add(M1, M2)?;
    //a = m * (N1 - N2) / T
    let a = div(mul(m, sub(N1, N2)?)?, T)?;
    //b = N2 * (T + m) / M2
    let b = div(mul(N2, add(T, m)?)?, M2)?;
    //c = T * (M1 + m) / (M1 * (T + m))
    let c = div(mul(T, add(M1, m)?)?, mul(M1, add(T, m)?)?)?;
    //d = log(c)
    let d = c.ln();
    //e = a + b * d
    add(a, mul(b, d)?)
}

/// Get the payoff for the shares given, with M being the globally
/// invested amount, N_1 is the amount of shares for the outcome that's
/// won, and n is the user's amount of shares.
#[allow(non_snake_case)]
pub fn payoff(n: Decimal, N_1: Decimal, M: Decimal) -> Result<Decimal, Error> {
    mul(div(n, N_1)?, M)
}

fn sqrt_u256_round_down(x: U256) -> Result<U256, Error> {
    // Since the Rust implementation uses some floating point conversions
    // the Stylus runtime doesn't have. Uses the Babylonian Method. Rounds down.
    if x.is_zero() {
        return Ok(U256::ZERO);
    }
    let mut z = (x >> 1) + U256::from(1);
    let mut y = x;
    while z < y {
        y = z;
        z = (x / z + z) >> 1;
    }
    if y * y > x {
        y -= U256::from(1);
    }
    Ok(y)
}

pub fn price_to_sqrt_price(x: U256) -> Result<U256, Error> {
    Ok(sqrt_u256_round_down(x)? * U256::from(2).pow(U256::from(96)))
}

#[test]
fn test_sqrt_rounding_down() {
    assert_eq!(sqrt_u256_round_down(U256::from(1)).unwrap(), U256::from(1));
    assert_eq!(sqrt_u256_round_down(U256::from(2)).unwrap(), U256::from(1));
    assert_eq!(sqrt_u256_round_down(U256::from(3)).unwrap(), U256::from(1));
    assert_eq!(sqrt_u256_round_down(U256::from(4)).unwrap(), U256::from(2));
}

#[test]
fn test_price_single() {
    dbg!(shares(
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
        shares(
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
