
use stylus_sdk::{
    alloy_primitives::{FixedBytes, U256},
    storage::{GlobalStorage, StorageCache, StorageGuardMut, StorageType},
};

use rust_decimal::{prelude::*, Decimal, MathematicalOps};

use std::{cell::OnceCell, ops::Deref};

use crate::{assert_or, error::Error};

pub(crate) fn u256_to_decimal(n: U256, decimals: u8) -> Result<Decimal, Error> {
    if n.is_zero() {
        return Ok(Decimal::ZERO);
    }

    let (n, rem) = n.div_rem(U256::from(10).pow(U256::from(decimals)));

    let n: u128 = u128::from_le_bytes(n.to_le_bytes::<32>()[..16].try_into().unwrap());
    let rem: u128 = u128::from_le_bytes(rem.to_le_bytes::<32>()[..16].try_into().unwrap());

    let n = Decimal::from(n);
    let rem = Decimal::from(rem);

    Ok(n + rem / Decimal::from(10).powi(decimals as i64))
}

pub(crate) fn decimal_to_u256(n: Decimal, decimals: u8) -> Result<U256, Error> {
    if n.is_zero() {
        return Ok(U256::ZERO);
    }
    assert_or!(n.is_sign_positive(), Error::NegativeFixedToUintConv);
    let q = U256::from(n.to_u64().ok_or(Error::CheckedMulOverflow)?);
    let r = U256::from(
        n.checked_rem(Decimal::from(1))
            .ok_or(Error::CheckedMulOverflow)?
            .checked_mul(Decimal::from(10).powi(decimals as i64))
            .ok_or(Error::CheckedMulOverflow)?
            .to_u64()
            .ok_or(Error::CheckedMulOverflow)?,
    );
    Ok(q * U256::from(10).pow(U256::from(decimals)) + r)
}

#[derive(Debug, Clone)]
pub struct StorageDecimal {
    slot: U256,
    offset: u8,
    cached: OnceCell<Decimal>,
}

impl StorageDecimal {
    pub fn get(&self) -> Decimal {
        *self.clone()
    }

    pub fn set(&mut self, v: Decimal) {
        self.cached.take();
        _ = self.cached.set(v);
        let mut b = [0_u8; 16];
        b.copy_from_slice(&v.serialize());
        unsafe {
            StorageCache::set::<16>(
                self.slot,
                self.offset.into(),
                FixedBytes::<16>::from_slice(&b),
            )
        }
    }
}

impl StorageType for StorageDecimal {
    type Wraps<'a> = Decimal;
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

impl Deref for StorageDecimal {
    type Target = Decimal;

    fn deref(&self) -> &Self::Target {
        self.cached.get_or_init(|| unsafe {
            let b = StorageCache::get::<16>(self.slot, self.offset.into());
            if b.is_zero() {
                Decimal::ZERO
            } else {
                Decimal::deserialize(b.as_slice().try_into().unwrap())
            }
        })
    }
}

impl From<StorageDecimal> for Decimal {
    fn from(v: StorageDecimal) -> Self {
        *v
    }
}

#[macro_export]
macro_rules! assert_eq_f {
    ($left:expr, $right:expr $(,)?) => {
        match (&$left, &$right) {
            (left_val, right_val) => {
                let right_val_add = right_val + (right_val * rust_decimal_macros::dec!(1e-6));
                // !(left_val <= (right_val + right_val * 0.0000001))
                if !(*left_val <= right_val_add) {
                    panic!(
                        "!({} == {} || {} <= {})",
                        left_val, right_val, left_val, right_val_add
                    );
                }
            }
        }
    };
}

#[cfg(all(test, feature = "testing"))]
mod test {
    use rust_decimal::Decimal;

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
            let mut f = StorageDecimal {
                slot: U256::from(0),
                offset: 0,
                cached: OnceCell::new(),
            };
            assert_eq!(f.get(), Decimal::from(0));
            f.set(Decimal::MAX);
            assert_eq!(f.get(), Decimal::MAX);
        })
    }
}

#[cfg(all(test, not(target_arch = "wasm32")))]
mod proptesting {
    use super::*;

    use proptest::prelude::*;

    use stylus_sdk::alloy_primitives::U256;

    proptest! {
        #[test]
        fn test_decoding_to_and_from(
            x in 1e6 as u64 * 2..1000000000000000
        ) {
            let d = 6;
            let n = U256::from_limbs([x, 0, 0, 0]);
            let res = decimal_to_u256(u256_to_decimal(n, d).unwrap(), d).unwrap();
            assert!(res == n - U256::from(1) || res == n, "{res} != {n}");
        }
    }
}