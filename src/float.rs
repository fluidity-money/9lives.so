use stylus_sdk::storage::{GlobalStorage, StorageCache, StorageGuardMut, StorageType};

use std::{cell::OnceCell, ops::Deref};

use stylus_sdk::alloy_primitives::{FixedBytes, U256};

use astro_float::{BigFloat, Sign};

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
    b[8..8 + words[1].to_be_bytes().len()].copy_from_slice(&words[1].to_be_bytes());
    b[16..16 + sig_bits.to_be_bytes().len()].copy_from_slice(&sig_bits.to_be_bytes());
    b[24] = match sign {
        Sign::Neg => 0,
        Sign::Pos => 1,
    };
    b[25..25 + exp.to_be_bytes().len()].copy_from_slice(&exp.to_be_bytes());
    b[31] = inexact.into();
    b
}

fn unpack_float_words(b: &[u8]) -> ([u64; 2], usize, Sign, i32, bool) {
    let word0 = u64::from_be_bytes(b[..8].try_into().unwrap());
    let word1 = u64::from_be_bytes(b[8..16].try_into().unwrap());
    let sig_bits = usize::from_be_bytes(b[16..24].try_into().unwrap());
    let sign = match b[24] {
        0 => Sign::Neg,
        1 => Sign::Pos,
        _ => panic!("WTF"),
    };
    let exp = i32::from_be_bytes(b[25..29].try_into().unwrap());
    let inexact = b[31] == 1;
    ([word0, word1], sig_bits, sign, exp, inexact)
}

#[cfg(test)]
mod propesting {
    use proptest::prelude::*;

    use astro_float::BigFloat;

    use crate::maths;

    use super::*;

    proptest! {
        #[test]
        fn test_byte_conversion(
            no_0 in 1..18446744073709551615_u64,
            no_1 in 1..18446744073709551615_u64,
            decimals in 1..60_u8
        ) {
            let i = U256::from_limbs([no_0, no_1, 0, 0]);
            let a = maths::u256_to_float(i, decimals).map_err(|e| panic!("e: {e} bad i: {}, dec: {}", i, decimals)).unwrap();
            let (words, sig_bits, sign, exp, inexact) = a.as_raw_parts().unwrap();
            let packed = pack_float_words(words, sig_bits, sign, exp, inexact);
            let (words, sig_bits, sign, exp, inexact) = unpack_float_words(&packed);
            let b = BigFloat::from_raw_parts(&words, sig_bits, sign, exp, inexact);
            assert_eq!(b, a, "{} != {}", b, a);
        }
    }
}

#[test]
fn test_max_number_to_bytes() {
    use crate::maths;

    let i = maths::MAX_NUMBER;
    let a = maths::u256_to_float(i, 6).unwrap();
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
