use fixed::types::I64F64;

use crate::error::Error;

fn exp(x: I64F64) -> I64F64 {
    let mut term = I64F64::from_num(1);
    let mut result = term;
    for i in 1..100 {
        term = term * x / I64F64::from_num(i);
        result = result + term;
        if term < I64F64::from_num(1e-10) {
            break;
        }
    }
    result
}

fn log10(x: I64F64) -> I64F64 {
    let one = I64F64::from_num(1);
    let mut guess = x - one; // Initial guess
    let mut diff;
    loop {
        let e_guess = exp(guess); // Exp(guess)
        diff = (e_guess - x) / e_guess;
        guess = guess - diff;
        if diff < I64F64::from_num(1e-10) {
            break;
        }
    }
    guess
}

#[allow(non_snake_case)]
pub fn price(M1: I64F64, M2: I64F64, N1: I64F64, N2: I64F64, m: I64F64) -> Result<I64F64, Error> {
    let T = M1 + M2;
    let M2_m = M2.checked_sub(m).ok_or(Error::CheckedSub)?;
    let denom = (M1 + m) * M2 * N1
        + M2_m * M2 * N2
        + T * (M1 + m) * N2 * log10(T * (M1 + m) / (M1 * (T + m)));
    Ok((M1 + m) * M2 * T / denom)
}

#[allow(non_snake_case)]
pub fn shares(M1: I64F64, M2: I64F64, N1: I64F64, N2: I64F64, m: I64F64) -> Result<I64F64, Error> {
    let T = M1 + M2;
    let N1_N2 = N1.checked_sub(N2).ok_or(Error::CheckedSub)?;
    Ok(m * N1_N2 / T + N2 * (T + m) / M2 * log10(T * (M1 + m) / (M1 * (T + m))))
}

#[allow(non_snake_case)]
pub fn payoff(n: I64F64, N_1: I64F64, M: I64F64) -> I64F64 {
    (n / N_1) * M
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
