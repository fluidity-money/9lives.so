use fixed::types::I64F64;

use crate::error::Error;

fn exp(x: I64F64) -> Result<I64F64, Error> {
    let mut term = I64F64::from_num(1);
    let mut res = term;
    for i in 1..100 {
        term = mul(term, x)?
            .checked_div_int(i)
            .ok_or(Error::CheckedAddOverflow)?;
        res = add(res, term)?;
        if term < I64F64::from_num(1e-10) {
            break;
        }
    }
    Ok(res)
}

fn log10(x: I64F64) -> Result<I64F64, Error> {
    let one = I64F64::from_num(1);
    let mut guess = sub(x, one)?;
    let mut diff;
    loop {
        let e_guess = exp(guess)?;
        diff = div(sub(e_guess, x)?, e_guess)?;
        guess = sub(guess, diff)?;
        if diff < I64F64::from_num(1e-10) {
            break;
        }
    }
    Ok(guess)
}

fn add(x: I64F64, y: I64F64) -> Result<I64F64, Error> {
    x.checked_add(y).ok_or(Error::CheckedAddOverflow)
}
fn mul(x: I64F64, y: I64F64) -> Result<I64F64, Error> {
    x.checked_mul(y).ok_or(Error::CheckedMulOverflow)
}
fn sub(x: I64F64, y: I64F64) -> Result<I64F64, Error> {
    x.checked_sub(y).ok_or(Error::CheckedSubOverflow)
}
fn div(x: I64F64, y: I64F64) -> Result<I64F64, Error> {
    x.checked_div(y).ok_or(Error::CheckedDivOverflow)
}

#[allow(non_snake_case)]
pub fn price(M1: I64F64, M2: I64F64, N1: I64F64, N2: I64F64, m: I64F64) -> Result<I64F64, Error> {
    //T = M1 + M2
    let T = add(M1, M2)?;
    //a = (M1 + m) * M2 * N1
    let a = mul(mul(add(M1, m)?, M2)?, N1)?;
    //b = (M2 - m) * M2 * N2
    let b = mul(mul(sub(M2, m)?, M2)?, N2)?;
    //c = T * (M1 + m) * N2
    let c = mul(mul(T, add(M1, m)?)?, N2)?;
    //d = math.log(T * (M1 + m) / (M1 * (T + m)))
    let d = log10(div(mul(T, add(M1, m)?)?, mul(M1, add(T, m)?)?)?)?;
    //e = a + b + c * d
    let e = add(add(a, b)?, mul(c, d)?)?;
    //p = (M1 + m) * M2 * T / e
    div(mul(mul(add(M1, m)?, M2)?, T)?, e)
}

#[allow(non_snake_case)]
pub fn shares(M1: I64F64, M2: I64F64, N1: I64F64, N2: I64F64, m: I64F64) -> Result<I64F64, Error> {
    //T = M1 + M2
    let T = add(M1, M2)?;
    //a = m * (N1 - N2) / T
    let a = div(mul(m, sub(N1, N2)?)?, T)?;
    //b = N2 * (T + m) / M2
    let b = div(mul(N2, add(T, m)?)?, M2)?;
    //c = T * (M1 + m) / (M1 * (T + m))
    let c = div(mul(T, add(M1, m)?)?, mul(M1, add(T, m)?)?)?;
    //d = log(c)
    let d = log10(c)?;
    //e = a + b * d
    add(a, mul(b, d)?)
}

#[allow(non_snake_case)]
pub fn payoff(n: I64F64, N_1: I64F64, M: I64F64) -> Result<I64F64, Error> {
    mul(div(n, N_1)?, M)
}

#[test]
fn test_price_single() {
    dbg!(shares(
        I64F64::from_num(524),
        I64F64::from_num(387),
        I64F64::from_num(173),
        I64F64::from_num(411),
        I64F64::from_num(182)
    )
    .unwrap());
}

#[test]
fn test_shares_edge_1() {
    dbg!(shares(
        I64F64::unwrapped_from_str("0.1"),
        I64F64::unwrapped_from_str("4.270954"),
        I64F64::unwrapped_from_str("1"),
        I64F64::unwrapped_from_str("1"),
        I64F64::unwrapped_from_str("32699704.75266"),
    )
    .unwrap());
}
