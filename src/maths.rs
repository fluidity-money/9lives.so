use stylus_sdk::alloy_primitives::U256;

use astro_float::{BigFloat, Consts, RoundingMode};

use crate::{assert_or, error::Error};

pub fn u256_to_float(n: U256, decimals: u8) -> Result<BigFloat, Vec<u8>> {
    let (n, rem) = n.div_rem(U256::from(10).pow(U256::from(decimals)));
    assert_or!(n > U256::ZERO, Error::TooSmallNumber);

    let n: i128 = i128::from_le_bytes(n.to_le_bytes::<128>()[..16].try_into().unwrap());
    let rem: i128 = i128::from_le_bytes(rem.to_le_bytes::<128>()[..16].try_into().unwrap());

    let rm = RoundingMode::Down;
    let x = BigFloat::from(rem).div(&BigFloat::from(i128::pow(10, decimals.into())), 128, rm);
    Ok(x.add(&BigFloat::from(n), 128, rm))
}

#[allow(non_snake_case)]
pub fn price(
    M_1: &BigFloat,
    M_2: &BigFloat,
    N_1: &BigFloat,
    N_2: &BigFloat,
    m: &BigFloat,
) -> BigFloat {
    let mut cache = Consts::new().unwrap();
    let rm = RoundingMode::Down;
    let T = M_1.add(M_2, 128, rm);
    //a = (M1+m)*M2*N1
    let a = M_1.add(m, 128, rm).mul(&M_2.mul(N_1, 128, rm), 128, rm);
    //b = (M2-m)*M2*N2
    let b = M_2.sub(m, 128, rm).mul(&M_2.mul(N_2, 128, rm), 128, rm);
    //c = T*(M1+m)*N2
    let c = T.mul(&M_1.add(m, 128, rm), 128, rm).mul(N_2, 128, rm);
    //d = math.log(T*(M1+m)/(M1*(T+m)))
    let d = T
        .mul(&M_1.add(m, 128, rm), 128, rm)
        .div(&M_1.mul(&T.add(m, 128, rm), 128, rm), 128, rm)
        .ln(128, rm, &mut cache);
    //e = a+b+c*d
    let e = a.add(&b, 128, rm).add(&c.mul(&d, 128, rm), 128, rm);
    //p = (M1+m)*M2*T/e
    M_1.add(m, 128, rm)
        .mul(M_2, 128, rm)
        .mul(&T, 128, rm)
        .div(&e, 128, rm)
}

#[allow(non_snake_case)]
pub fn shares(
    M_1: &BigFloat, // Amount of money invested in this outcome.
    M_2: &BigFloat, // Amount of money invested in the other outcomes.
    N_1: &BigFloat, // Shares in circulation in this outcome.
    N_2: &BigFloat, // Shares in circulation in the other outcomes.
    m: &BigFloat,   // Amount to spend when purchasing.
) -> BigFloat {
    let mut cache = Consts::new().unwrap();
    let rm = RoundingMode::None;
    //T = M1+M2
    let T = M_1.add(M_2, 128, rm);
    //a = m*(N1-N2)/T
    let a = m.mul(&N_1.sub(N_2, 128, rm), 128, rm).div(&T, 128, rm);
    //b = N2*(T+m)/M2
    let b = N_2.mul(&T.add(m, 128, rm), 128, rm).div(M_2, 128, rm);
    //c = T*(M1+m)/(M1*(T+m))
    let c =
        T.mul(&M_1.add(m, 128, rm), 128, rm)
            .div(&M_1.mul(&T.add(m, 128, rm), 128, rm), 128, rm);
    let d = c.ln(128, rm, &mut cache); //d = math.log(c)
    a.add(&b.mul(&d, 128, rm), 128, rm) //e = a+b*d
}

#[test]
fn test_u256_to_float() {
    assert_eq!(
        u256_to_float(U256::from(55) * U256::from(10).pow(U256::from(17)), 18).unwrap(),
        BigFloat::from(5.5)
    );
}

#[test]
fn test_shares_isolated() {
    let m_1 = BigFloat::from(998);
    let m_2 = BigFloat::from(38);
    let n_1 = BigFloat::from(333);
    let n_2 = BigFloat::from(611);
    let cost = BigFloat::from(265);

    let s = shares(&m_1, &m_2, &n_1, &n_2, &cost);

    assert_eq!(
        s,
        BigFloat::from(90.503531282390116),
        "{} != 90.503531282390116",
        s.to_string()
    );
}

#[test]
fn test_price_isolated() {
    let m_1 = BigFloat::from(998);
    let m_2 = BigFloat::from(38);
    let n_1 = BigFloat::from(333);
    let n_2 = BigFloat::from(611);
    let cost = BigFloat::from(265);

    let s = price(&m_1, &m_2, &n_1, &n_2, &cost);

    assert_eq!(
        s,
        BigFloat::from(2.944193295000662),
        "{} != 2.944193295000662",
        s.to_string()
    );
}

#[test]
fn test_dpm_offline() {
    // shares purchased,price before A,price before B,price after A,price after B,new M1,new M2,new N1,new N2
    // 3109.5319946499903,0.12648143330073658,1.108376770766981,0.35972257380850425,0.11562511300987638,1036,333,3720.5319946499903,265

    let cost = BigFloat::from(998);
    let m_1 = BigFloat::from(38);
    let m_2 = BigFloat::from(333);
    let n_1 = BigFloat::from(611);
    let n_2 = BigFloat::from(265);

    let shares_purchased = shares(&m_1, &m_2, &n_1, &n_2, &cost);

    assert_eq!(
        shares_purchased,
        BigFloat::from(3109.5319946499903),
        "{} != 3109.5319946499903",
        shares_purchased
    );

    let price_before_a = price(&m_1, &m_2, &n_1, &n_2, &BigFloat::from(0));

    assert_eq!(
        price_before_a,
        BigFloat::from(0.12648143330073658),
        "{} != 0.12648143330073658",
        price_before_a
    );

    let price_before_b = price(&m_2, &m_1, &m_2, &n_1, &BigFloat::from(0));

    let new_m_1 = m_1.add(&cost, 128, RoundingMode::None);
    let new_n_1 = n_1.add(&shares_purchased, 128, RoundingMode::None);

    let price_after_a = price(&m_1, &m_2, &n_1, &m_2, &BigFloat::from(0));
    let price_after_b = price(&m_2, &m_1, &n_2, &n_1, &BigFloat::from(0));
}
