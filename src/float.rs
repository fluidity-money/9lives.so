use stylus_sdk::storage::{GlobalStorage, StorageCache, StorageGuardMut, StorageType};

use std::{cell::OnceCell, ops::Deref};

use stylus_sdk::alloy_primitives::{FixedBytes, U256};

use astro_float::{BigFloat, Consts, RoundingMode, Sign};

use crate::{assert_or, error::Error};

//340282366920938463463374607431768211455
pub const MAX_NUMBER: U256 = U256::from_limbs([18446744073709551615, 18446744073709551615, 0, 0]);

pub const PREC: usize = std::mem::size_of::<u128>();

pub fn u256_to_float(n: U256, decimals: u8) -> Result<BigFloat, Error> {
    assert_or!(n > U256::ZERO, Error::TooSmallNumber);
    assert_or!(n < MAX_NUMBER, Error::TooBigNumber);

    let (n, rem) = n.div_rem(U256::from(10).pow(U256::from(decimals)));

    let n: i128 = i128::from_le_bytes(n.to_le_bytes::<32>()[..16].try_into().unwrap());
    let rem: i128 = i128::from_le_bytes(rem.to_le_bytes::<32>()[..16].try_into().unwrap());

    let mut cache = Consts::new().unwrap();

    // Divide the number by the exponentiation of the decimals.
    let x = BigFloat::from(rem).div(
        &BigFloat::from(10).pow(
            &BigFloat::from(decimals),
            128,
            RoundingMode::None,
            &mut cache,
        ),
        PREC,
        RoundingMode::Down,
    );
    Ok(x.add(&BigFloat::from(n), PREC, RoundingMode::Down))
}

pub fn float_to_u256(_n: BigFloat, _decimals: u8) -> Result<U256, Error> {
    Ok(U256::from(0))
}

#[derive(Debug, Clone)]
pub struct StorageBigFloat {
    slot: U256,
    offset: u8,
    cached: OnceCell<BigFloat>,
}

impl StorageBigFloat {
    pub fn get(&self) -> BigFloat {
        self.clone().into()
    }

    pub fn set(&mut self, v: BigFloat) {
        self.cached.take();
        _ = self.cached.set(v.clone());
        match v.as_raw_parts() {
            Some((words, sig_bytes, sign, exp, inexact)) => unsafe {
                StorageCache::set::<32>(
                    self.slot,
                    self.offset.into(),
                    FixedBytes::<32>::from_slice(&pack_float_words(
                        words, sig_bytes, sign, exp, inexact,
                    )),
                )
            },
            None => unsafe {
                StorageCache::set::<32>(
                    self.slot,
                    self.offset.into(),
                    FixedBytes::<32>::from_slice(&[0_u8; 32]),
                )
            },
        }
    }
}

impl StorageType for StorageBigFloat {
    type Wraps<'a> = BigFloat;
    type WrapsMut<'a> = StorageGuardMut<'a, Self>;

    const SLOT_BYTES: usize = 32;

    unsafe fn new(slot: U256, offset: u8) -> Self {
        Self {
            slot,
            offset,
            cached: OnceCell::new(),
        }
    }

    fn load<'s>(self) -> Self::Wraps<'s> {
        self.get()
    }

    fn load_mut<'s>(self) -> Self::WrapsMut<'s> {
        StorageGuardMut::new(self)
    }
}

impl Deref for StorageBigFloat {
    type Target = BigFloat;

    fn deref(&self) -> &Self::Target {
        self.cached.get_or_init(|| unsafe {
            let b = StorageCache::get::<32>(self.slot, self.offset.into());
            let (words, sig_bits, sign, exp, inexact) = unpack_float_words(b.as_slice());
            BigFloat::from_raw_parts(&words, sig_bits, sign, exp, inexact)
        })
    }
}

impl From<StorageBigFloat> for BigFloat {
    fn from(v: StorageBigFloat) -> Self {
        v.into()
    }
}

fn pack_float_words(
    words: &[u64],
    sig_bits: usize,
    sign: Sign,
    exp: i32,
    inexact: bool,
) -> [u8; 32] {
    let mut b = [0_u8; 32];
    b[..words[0].to_be_bytes().len()].copy_from_slice(&words[0].to_be_bytes());
    // Don't set the storage if the word doesn't exist.
    match words.len() {
        2 => b[8..8 + words[1].to_be_bytes().len()].copy_from_slice(&words[1].to_be_bytes()),
        1 => (),
        i => panic!("float words len: {}", i)
    }
    b[16..16 + sig_bits.to_be_bytes().len()].copy_from_slice(&sig_bits.to_be_bytes());
    b[24] = match sign {
        Sign::Neg => 0,
        Sign::Pos => 1,
    };
    b[25..25 + exp.to_be_bytes().len()].copy_from_slice(&exp.to_be_bytes());
    b[31] = inexact.into();
    b
}

fn unpack_float_words<'a>(b: &[u8]) -> (Vec<u64>, usize, Sign, i32, bool) {
    let word0 = u64::from_be_bytes(b[..8].try_into().unwrap());
    let word1 = u64::from_be_bytes(b[8..16].try_into().unwrap());
    let sig_bits = usize::from_be_bytes(b[16..24].try_into().unwrap());
    let sign = match b[24] {
        0 => Sign::Neg,
        1 => Sign::Pos,
        _ => unreachable!(),
    };
    let exp = i32::from_be_bytes(b[25..29].try_into().unwrap());
    let inexact = b[31] == 1;
    let words = match word1 {
        0 => vec![word0],
        word1 => vec![word0, word1],
    };
    (words, sig_bits, sign, exp, inexact)
}

#[cfg(test)]
mod propesting {
    use proptest::prelude::*;

    use astro_float::BigFloat;

    use super::*;

    proptest! {
        #[test]
        fn test_byte_conversion(
            no_0 in 1..18446744073709551615_u64,
            no_1 in 1..18446744073709551615_u64,
            decimals in 1..60_u8
        ) {
            let i = U256::from_limbs([no_0, no_1, 0, 0]);
            let a = u256_to_float(i, decimals).map_err(|e| panic!("e: {e} bad i: {}, dec: {}", i, decimals)).unwrap();
            let (words, sig_bits, sign, exp, inexact) = a.as_raw_parts().unwrap();
            let packed = pack_float_words(words, sig_bits, sign, exp, inexact);
            let (words, sig_bits, sign, exp, inexact) = unpack_float_words(&packed);
            let b = BigFloat::from_raw_parts(&words, sig_bits, sign, exp, inexact);
            assert_eq!(b, a, "{} != {}", b, a);
        }
    }
}

#[test]
fn min_number_to_bytes() {
    let i = U256::from(1);
    let a = u256_to_float(i, 6).unwrap();
    assert_eq!(a, BigFloat::from(1e-06), "{} != {}", a, 1e-06);
    let d = a.as_raw_parts().unwrap();
    let (words, sig_bits, sign, exp, inexact) = d;
    let packed = pack_float_words(words, sig_bits, sign, exp, inexact);
    let (u_words, u_sig_bits, u_sign, u_exp, u_inexact) = unpack_float_words(&packed);
    assert_eq!(u_words, words);
    assert_eq!(u_sig_bits, sig_bits);
    assert_eq!(u_sign, sign);
    assert_eq!(u_exp, exp);
    assert_eq!(u_inexact, inexact);
}

#[test]
fn test_max_number_to_bytes() {
    let i = MAX_NUMBER - U256::from(1);
    let a = u256_to_float(i, 6).unwrap();
    let d = a.as_raw_parts().unwrap();
    let (words, sig_bits, sign, exp, inexact) = d;
    let packed = pack_float_words(words, sig_bits, sign, exp, inexact);
    let (u_words, u_sig_bits, u_sign, u_exp, u_inexact) = unpack_float_words(&packed);
    assert_eq!(u_words, words);
    assert_eq!(u_sig_bits, sig_bits);
    assert_eq!(u_sign, sign);
    assert_eq!(u_exp, exp);
    assert_eq!(u_inexact, inexact);
}

#[test]
fn test_custom_words() {
    // Add an extra word, and see if it packs okay.

    let i = MAX_NUMBER - U256::from(1);
    let a = u256_to_float(i, 6).unwrap();
    let d = a.as_raw_parts().unwrap();
    let (words, sig_bits, sign, exp, inexact) = d;
    let mut words = words.to_vec();
    words.push(18446744073709551615);
    let packed = pack_float_words(&words, sig_bits, sign, exp, inexact);
    let (u_words, u_sig_bits, u_sign, u_exp, u_inexact) = unpack_float_words(&packed);
    assert_eq!(u_words, words);
    assert_eq!(u_sig_bits, sig_bits);
    assert_eq!(u_sign, sign);
    assert_eq!(u_exp, exp);
    assert_eq!(u_inexact, inexact);
}
