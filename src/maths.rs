// Floating point numbers in this code are 64 bit integers with a
// floating point precision of 64 bits. We track the amount of the native
// token using a U256, which is then divided by the decimals, and
// converted to a float elsewhere.

use astro_float::{BigFloat, Consts, RoundingMode};

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
fn test_cost() {
    use std::str::FromStr;
    /* assert_eq!(
        price(
            BigFloat::from(100000),
            BigFloat::from(200),
            BigFloat::from(200),
            BigFloat::from(200)
        )
        .to_string(),
        BigFloat::from_str("1.6886237168345496e-19")
            .unwrap()
            .to_string()
    ); */
}
