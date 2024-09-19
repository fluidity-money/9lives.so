use fixed::types::I64F64;

use stylus_sdk::storage::{GlobalStorage, StorageCache, StorageGuardMut, StorageType};

use std::{
    cell::OnceCell,
    ops::{Deref, Rem},
};

use stylus_sdk::alloy_primitives::{FixedBytes, U256};

use crate::{assert_or, error::Error};

pub const MAX_NUMBER: U256 = U256::from_limbs([9223372036854775807, 0, 0, 0]);

fn pow(base: I64F64, exp: u8) -> Result<I64F64, Error> {
    let mut r = I64F64::from(1);
    for _ in 0..exp {
        r = r.checked_mul(base).ok_or(Error::CheckedPowOverflow)?;
    }
    Ok(r)
}

pub fn u256_to_fixed(n: U256, decimals: u8) -> Result<I64F64, Error> {
    assert_or!(
        n > U256::from(10).pow(U256::from(decimals)),
        Error::TooSmallNumber
    );
    assert_or!(n < MAX_NUMBER, Error::TooBigNumber);

    let (n, rem) = n.div_rem(U256::from(10).pow(U256::from(decimals)));

    let n: u128 = u128::from_le_bytes(n.to_le_bytes::<32>()[..16].try_into().unwrap());
    let rem: u128 = u128::from_le_bytes(rem.to_le_bytes::<32>()[..16].try_into().unwrap());

    let n = I64F64::from_num(n);
    let rem = I64F64::from_num(rem);

    Ok(n + rem / pow(I64F64::from_num(10), decimals)?)
}

// Return the fixed amount, cutting off the decimals.
pub fn fixed_to_u256(n: I64F64, decimals: u8) -> Result<U256, Error> {
    if n.is_zero() {
        return Ok(U256::ZERO);
    }
    let q = U256::from(n.to_bits() >> 64);
    let r = U256::from(
        n.rem(I64F64::from(1))
            .checked_mul(pow(I64F64::from(10), decimals)?)
            .ok_or(Error::CheckedMulOverflow)?
            .to_bits()
            >> 64,
    );
    Ok(q * U256::from(10).pow(U256::from(decimals)) + r)
}

#[derive(Debug, Clone)]
pub struct StorageFixed {
    slot: U256,
    offset: u8,
    cached: OnceCell<I64F64>,
}

impl StorageFixed {
    pub fn get(&self) -> I64F64 {
        *self.clone()
    }

    pub fn set(&mut self, v: I64F64) {
        self.cached.take();
        _ = self.cached.set(v.clone());
        let mut b = [0_u8; 32];
        b[..16].copy_from_slice(&v.to_be_bytes());
        unsafe {
            StorageCache::set::<32>(
                self.slot,
                self.offset.into(),
                FixedBytes::<32>::from_slice(&b),
            )
        }
    }
}

impl StorageType for StorageFixed {
    type Wraps<'a> = I64F64;
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

impl Deref for StorageFixed {
    type Target = I64F64;

    fn deref(&self) -> &Self::Target {
        self.cached.get_or_init(|| unsafe {
            let b = StorageCache::get::<32>(self.slot, self.offset.into());
            if b.is_zero() {
                I64F64::from(0)
            } else {
                I64F64::from_be_bytes(b.as_slice()[..16].try_into().unwrap())
            }
        })
    }
}

impl From<StorageFixed> for I64F64 {
    fn from(v: StorageFixed) -> Self {
        v.into()
    }
}

#[macro_export]
macro_rules! assert_eq_f {
    ($left:expr, $right:expr $(,)?) => {
        match (&$left, &$right) {
            (left_val, right_val) => {
                let right_val_sub =  right_val - (right_val * I64F64::from_num(0.000000001));
                let right_val_add = right_val + (right_val * I64F64::from_num(0.000000001));
                //if left_val >= (right_val - right_val * 0.000000001) && left_val <= (right_val + right_val * 0.000000001)
                if !(*left_val >= right_val_sub && *left_val <= right_val_add) {
                    panic!(
                        "!({} == {} || ({} >= {} && {} <= {}))",
                        left_val,
                        right_val,
                        left_val,
                        right_val_sub,
                        left_val,
                        right_val_add
                    );
                }
            }
        }
    };
}

#[cfg(all(test, feature = "testing"))]
mod test {
    use fixed::types::I64F64;

    use stylus_sdk::alloy_primitives::U256;

    use crate::host;

    use super::*;

    use std::cell::OnceCell;

    #[stylus_sdk::prelude::storage]
    struct Stubbed {}

    impl host::StorageNew for Stubbed {
        fn new(i: U256, v: u8) -> Self {
            unsafe { <Self as stylus_sdk::storage::StorageType>::new(i, v) }
        }
    }

    #[test]
    fn test_storage_behaviour() {
        host::with_storage::<_, Stubbed, _>(|_| {
            let mut f = StorageFixed {
                slot: U256::from(0),
                offset: 0,
                cached: OnceCell::new(),
            };
            assert_eq!(f.get(), I64F64::from(0));
            f.set(I64F64::MAX);
            assert_eq!(f.get(), I64F64::MAX);
        })
    }
}

#[test]
fn pow_10_16() {
    assert_eq!(
        pow(I64F64::from(10), 16).unwrap(),
        I64F64::from(100000000) * I64F64::from(100000000)
    )
}

#[test]
fn fixed_min_input() {
    let x = U256::from_limbs([100000000000000000, 0, 0, 0]);
    let d = 16;
    let n = u256_to_fixed(x, d).unwrap();
    assert_eq!(fixed_to_u256(n, d).unwrap(), x);
}

#[cfg(all(test, not(target_arch = "wasm32")))]
mod proptesting {
    use super::*;

    use proptest::prelude::*;

    use stylus_sdk::alloy_primitives::U256;

    proptest! {
        #[test]
        fn test_decoding_to_and_from(
            x in 100000000000000000..9223372036854775807_u64
        ) {
            let d = 16;
            let n = U256::from_limbs([x, 0, 0, 0]);
            assert_eq!(fixed_to_u256(u256_to_fixed(n, d).unwrap(), d).unwrap(), n);
        }
    }
}
