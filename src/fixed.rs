use fixed::types::I64F64;

use stylus_sdk::storage::{GlobalStorage, StorageCache, StorageGuardMut, StorageType};

use std::{cell::OnceCell, ops::Deref};

use stylus_sdk::alloy_primitives::{FixedBytes, U256};

use crate::{assert_or, error::Error};

pub const MAX_NUMBER: U256 = U256::from_limbs([9223372036854775807, 0, 0, 0]);

fn pow(base: I64F64, mut exp: u8) -> I64F64 {
    let one = I64F64::from_num(1);
    let mut res = one;
    let mut base = base;
    while exp > 0 {
        if exp % 2 == 1 {
            res *= base;
        }
        base *= base;
        exp /= 2;
    }
    res
}

pub fn u256_to_fixed(n: U256, decimals: u8) -> Result<I64F64, Error> {
    assert_or!(n > U256::ZERO, Error::TooSmallNumber);
    assert_or!(n < MAX_NUMBER, Error::TooBigNumber);

    let (n, rem) = n.div_rem(U256::from(10).pow(U256::from(decimals)));

    let n: u128 = u128::from_le_bytes(n.to_le_bytes::<32>()[..16].try_into().unwrap());
    let rem: u128 = u128::from_le_bytes(rem.to_le_bytes::<32>()[..16].try_into().unwrap());

    let n = I64F64::from_num(n);
    let rem = I64F64::from_num(rem);

    Ok(n + rem / pow(I64F64::from_num(10), decimals))
}

pub fn fixed_to_u256(_n: I64F64, _decimals: u8) -> Result<U256, Error> {
    // Get the exp, and the mantissa, then get the exp as the word, then
    // shift the right side into it at the offset
    Ok(U256::from(0))
}

#[derive(Debug, Clone)]
pub struct StorageFixed {
    slot: U256,
    offset: u8,
    cached: OnceCell<I64F64>,
}

impl StorageFixed {
    pub fn get(&self) -> I64F64 {
        self.clone().into()
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
            I64F64::from_be_bytes(b.as_slice().try_into().unwrap())
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