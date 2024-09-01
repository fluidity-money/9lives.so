// Floating point numbers in this code are 64 bit integers with a
// floating point precision of 64 bits. We track the amount of the native
// token using a U256, which is then divided by the decimals, and
// converted to a float elsewhere.

use stylus_sdk::alloy_primitives::U256;

use astro_float::{BigFloat, Consts, RoundingMode};

use crate::{assert_or, error::Error};

pub fn u256_to_float(n: U256, decimals: u8) -> Result<BigFloat, Vec<u8>> {
    let (n, rem) = n.div_rem(U256::from(10).pow(U256::from(decimals)));
    assert_or!(n > U256::ZERO, Error::TooSmallNumber);

    let n: i128 = i128::from_le_bytes(n.to_le_bytes::<32>()[..16].try_into().unwrap());
    let rem: i128 = i128::from_le_bytes(rem.to_le_bytes::<32>()[..16].try_into().unwrap());

    let rm = RoundingMode::Down;
    let x = BigFloat::from(rem).div(&BigFloat::from(i128::pow(10, decimals.into())), 32, rm);
    Ok(x.add(&BigFloat::from(n), 32, rm))
}

#[allow(non_snake_case)]
pub fn price(
    n: BigFloat,   // Shares to purchase.
    M_1: BigFloat, // Amount of money invested in this outcome.
    N_2: BigFloat, // Amount of shares in the other outcomes.
) -> BigFloat {
    //(M1 / N2) * math.exp(n / N2)
    let rm = RoundingMode::Down;
    let a = M_1.mul(&N_2, 32, rm);
    let b = n.div(&N_2, 32, rm).sqrt(32, rm);
    let p = a.mul(&b, 32, rm);
    p
}

#[allow(non_snake_case)]
pub fn cost(
    n: BigFloat,   // Shares to purchase.
    M_1: BigFloat, // Amount of money invested in this outcome.
    N_2: BigFloat, // Amount of shares in the other outcomes.
) -> BigFloat {
    let mut cache = Consts::new().unwrap();
    let rm = RoundingMode::Up;
    let a = n.div(&N_2, 32, rm);
    let b = a.exp(32, rm, &mut cache);
    let c = b.sub(&BigFloat::from(1), 32, rm);
    let p = M_1.mul(&c, 32, rm);
    p
}

#[test]
fn test_u256_to_float() {
    let f = u256_to_float(U256::from(55) * U256::from(10).pow(U256::from(17)), 18).unwrap();
    dbg!(f.to_string());
}

#[test]
fn test_swag() {
    let f = BigFloat::from(100);
    dbg!(f.as_raw_parts().unwrap());
}
