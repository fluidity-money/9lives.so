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
    m: BigFloat,
    M_1: BigFloat, // Amount of money invested in this outcome.
    M_2: BigFloat, // Amount of money invested in the other outcomes.
    N_1: BigFloat, // Amount of shares in this outcome.
    N_2: BigFloat, // Amount of shares in the other outcomes.
) -> BigFloat {
    let mut cache = Consts::new().unwrap();
    let rm = RoundingMode::Down;
    let T = M_1.add(&M_2, 32, rm);
    //a = (M1+m)*M2*N1
    let a = M_1.add(&m, 32, rm).mul(&M_2.mul(&N_1, 32, rm), 32, rm);
    //b = (M2-m)*M2*N2
    let b = M_2.sub(&m, 32, rm).mul(&M_2.mul(&N_2, 32, rm), 32, rm);
    //c = T*(M1+m)*N2
    let c = T.mul(&M_1.add(&m, 32, rm), 32, rm).mul(&N_2, 32, rm);
    //d = math.log(T*(M1+m)/(M1*(T+m)))
    let d = T
        .mul(&M_1.add(&m, 32, rm), 32, rm)
        .div(&M_1.mul(&T.add(&m, 32, rm), 32, rm), 32, rm)
        .ln(32, rm, &mut cache);
    //e = a+b+c*d
    let e = a.add(&b, 32, rm).add(&c.mul(&d, 32, rm), 32, rm);
    //p = (M1+m)*M2*T/e
    let p = M_1
        .add(&m, 32, rm)
        .mul(&M_2, 32, rm)
        .mul(&T, 32, rm)
        .div(&e, 32, rm);
    p
}

#[allow(non_snake_case)]
pub fn shares(
    m: BigFloat,   // Amount to spend when purchasing.
    M_1: BigFloat, // Amount of money invested in this outcome.
    M_2: BigFloat, // Amount of money invested in the other outcomes.
    N_1: BigFloat, // Shares in circulation in this outcome.
    N_2: BigFloat, // Shares in circulation in the other outcomes.
) -> BigFloat {
    let mut cache = Consts::new().unwrap();
    let rm = RoundingMode::Down;
    //T = M1+M2
    let T = M_1.add(&M_2, 32, rm);
    //a = m*(N1-N2)/T
    let a = m.mul(&N_1.sub(&N_2, 32, rm), 32, rm).div(&T, 32, rm);
    //b = N2*(T+m)/M2
    let b = N_2.mul(&T.add(&m, 32, rm), 32, rm).div(&M_2, 32, rm);
    //c = T*(M1+m)/(M1*(T+m))
    let c = T
        .mul(&M_1.add(&m, 32, rm), 32, rm)
        .div(&M_1.mul(&T.add(&m, 32, rm), 32, rm), 32, rm);
    let d = c.ln(32, rm, &mut cache); //d = math.log(c)
    let e = a.add(&b.mul(&d, 32, rm), 32, rm); //e = a+b*d
    e
}

#[test]
fn test_u256_to_float() {
    assert_eq!(
        u256_to_float(U256::from(55) * U256::from(10).pow(U256::from(17)), 18).unwrap(),
        BigFloat::from(5.5)
    );
}

#[test]
fn test_shares() {
    let s = shares(
        BigFloat::from(50),
        BigFloat::from(100),
        BigFloat::from(100),
        BigFloat::from(100),
        BigFloat::from(100),
    );
    let e = BigFloat::from(45.580389198488646);
    assert_eq!(s, e, "{} not equal to {}", s, e);
}
