use fixed::types::U64F64;

use crate::error::Error;

fn exp(x: U64F64) -> U64F64 {
    let mut term = U64F64::from_num(1);
    let mut result = term;
    for i in 1..100 {
        term = term * x / U64F64::from_num(i);
        result = result + term;
        if term < U64F64::from_num(1e-10) {
            break;
        }
    }
    result
}

fn log10(x: U64F64) -> U64F64 {
    let one = U64F64::from_num(1);
    let mut guess = x - one; // Initial guess
    let mut diff;
    loop {
        let e_guess = exp(guess); // Exp(guess)
        diff = (e_guess - x) / e_guess;
        guess = guess - diff;
        if diff < U64F64::from_num(1e-10) {
            break;
        }
    }
    guess
}

#[allow(non_snake_case)]
pub fn price(M1: U64F64, M2: U64F64, N1: U64F64, N2: U64F64, m: U64F64) -> Result<U64F64, Error> {
    let T = M1 + M2;
    let M2_m = M2.checked_sub(m).ok_or(Error::CheckedSub)?;
    let denom = (M1 + m) * M2 * N1
        + M2_m * M2 * N2
        + T * (M1 + m) * N2 * log10(T * (M1 + m) / (M1 * (T + m)));
    Ok((M1 + m) * M2 * T / denom)
}

#[allow(non_snake_case)]
pub fn shares(M1: U64F64, M2: U64F64, N1: U64F64, N2: U64F64, m: U64F64) -> Result<U64F64, Error> {
    let T = M1 + M2;
    let N1_N2 = N1.checked_sub(N2).ok_or(Error::CheckedSub)?;
    Ok(m * N1_N2 / T + N2 * (T + m) / M2 * log10(T * (M1 + m) / (M1 * (T + m))))
}

#[allow(non_snake_case)]
pub fn payoff(n: U64F64, N_1: U64F64, M: U64F64) -> U64F64 {
    (n / N_1) * M
}

#[test]
fn test_price_single() {
    dbg!(shares(
        U64F64::from_num(524),
        U64F64::from_num(387),
        U64F64::from_num(173),
        U64F64::from_num(411),
        U64F64::from_num(182)
    )
    .unwrap());
}
