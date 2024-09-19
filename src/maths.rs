use fixed::types::I96F32;

use crate::{assert_or, error::Error};

const HARD_LOG_END: I96F32 = I96F32::unwrapped_from_str("4.174387269895637");

fn exp(x: I96F32) -> Result<I96F32, Error> {
    let mut term = I96F32::from_num(1);
    let mut res = term;
    for i in 1..100 {
        term = mul(term, x)?
            .checked_div_int(i)
            .ok_or(Error::CheckedAddOverflow)?;
        res = add(res, term)?;
        if term < I96F32::from_num(1e-6) {
            break;
        }
    }
    Ok(res)
}

fn ln(x: I96F32) -> Result<I96F32, Error> {
    assert_or!(!x.is_zero(), Error::Infinity);
    let one = I96F32::from_num(1);
    let mut guess = sub(x, one)?;
    let mut diff;
    for _ in 0..100 {
        let e_guess = exp(guess)?;
        diff = div(sub(e_guess, x)?, e_guess)?;
        guess = sub(guess, diff)?;
        if diff < I96F32::from_num(1e-6) {
            break;
        }
    }
    Ok(guess)
}

fn add(x: I96F32, y: I96F32) -> Result<I96F32, Error> {
    x.checked_add(y).ok_or(Error::CheckedAddOverflow)
}
fn mul(x: I96F32, y: I96F32) -> Result<I96F32, Error> {
    x.checked_mul(y).ok_or(Error::CheckedMulOverflow)
}
fn sub(x: I96F32, y: I96F32) -> Result<I96F32, Error> {
    x.checked_sub(y).ok_or(Error::CheckedSubOverflow)
}
fn div(x: I96F32, y: I96F32) -> Result<I96F32, Error> {
    x.checked_div(y).ok_or(Error::CheckedDivOverflow)
}

#[allow(non_snake_case)]
pub fn price(M1: I96F32, M2: I96F32, N1: I96F32, N2: I96F32, m: I96F32) -> Result<I96F32, Error> {
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
    let d = if d_1 > I96F32::from(50) {
        Ok(HARD_LOG_END) // FIXME
    } else {
        ln(d_1)
    }?;
    //e = a + b + c * d
    let e = add(add(a, b)?, mul(c, d)?)?;
    //p = (M1 + m) * M2 * T / e
    div(mul(mul(add(M1, m)?, M2)?, T)?, e)
}

#[allow(non_snake_case)]
pub fn shares(M1: I96F32, M2: I96F32, N1: I96F32, N2: I96F32, m: I96F32) -> Result<I96F32, Error> {
    //T = M1 + M2
    let T = add(M1, M2)?;
    //a = m * (N1 - N2) / T
    let a = div(mul(m, sub(N1, N2)?)?, T)?;
    //b = N2 * (T + m) / M2
    let b = div(mul(N2, add(T, m)?)?, M2)?;
    //c = T * (M1 + m) / (M1 * (T + m))
    let c = div(mul(T, add(M1, m)?)?, mul(M1, add(T, m)?)?)?;
    //d = log(c)
    // This is a huge number! Protect ourselves from somone allocating
    // this much in one go. Round them down! Fix me later.
    let d = if c > I96F32::from(65) {
        Ok(HARD_LOG_END) // FIXME
    } else {
        ln(c)
    }?;
    //e = a + b * d
    add(a, mul(b, d)?)
}

#[allow(non_snake_case)]
pub fn payoff(n: I96F32, N_1: I96F32, M: I96F32) -> Result<I96F32, Error> {
    mul(div(n, N_1)?, M)
}

#[test]
fn test_exp() {
    dbg!(exp(I96F32::from(32)).unwrap());
}

#[test]
fn test_ln() {
    assert_eq!(
        ln(I96F32::from(10)).unwrap(),
        I96F32::unwrapped_from_str("2.3025850968")
    );
}

#[test]
fn test_price_single() {
    dbg!(shares(
        I96F32::from_num(524),
        I96F32::from_num(387),
        I96F32::from_num(173),
        I96F32::from_num(411),
        I96F32::from_num(182)
    )
    .unwrap());
}

#[test]
fn test_shares_edge_1() {
    dbg!(shares(
        I96F32::unwrapped_from_str("0.1"),
        I96F32::unwrapped_from_str("4.370954"),
        I96F32::unwrapped_from_str("1"),
        I96F32::unwrapped_from_str("2"),
        I96F32::unwrapped_from_str("32699704.75266"),
    )
    .unwrap());
}

#[test]
fn test_shares_edge_2() {
    assert_eq!(
        shares(
            I96F32::unwrapped_from_str("1"),
            I96F32::unwrapped_from_str("1000215.097017"),
            I96F32::unwrapped_from_str("1"),
            I96F32::unwrapped_from_str("2"),
            I96F32::unwrapped_from_str("64.682966"),
        )
        .unwrap(),
        I96F32::unwrapped_from_str("8.369694342263648")
    )
}

#[test]
fn test_price_edge_1() {
    dbg!(price(
        I96F32::unwrapped_from_str("38"),
        I96F32::unwrapped_from_str("333"),
        I96F32::unwrapped_from_str("611"),
        I96F32::unwrapped_from_str("265"),
        I96F32::unwrapped_from_str("0"),
    )
    .unwrap());
}
