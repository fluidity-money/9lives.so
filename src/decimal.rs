use crate::immutables::{FUSDC_DECIMALS, SHARE_DECIMALS};

use stylus_sdk::alloy_primitives::U256;

use rust_decimal::{prelude::*, Decimal};

use crate::{assert_or, error::*};

/// Max decimal straight from rust_decimal documentation.
pub const MAX_DECIMAL: u128 = 79_228_162_514_264_337_593_543_950_335;

fn u256_to_decimal(n: U256, decimals: u8) -> R<Decimal> {
    if n.is_zero() {
        return Ok(Decimal::ZERO);
    }
    let (n, rem) = n.div_rem(U256::from(10).pow(U256::from(decimals)));
    let n: u128 = u128::from_le_bytes(n.to_le_bytes::<32>()[..16].try_into().unwrap());
    let rem: u128 = u128::from_le_bytes(rem.to_le_bytes::<32>()[..16].try_into().unwrap());
    if n > MAX_DECIMAL {
        return Err(Error::U256TooLarge);
    }
    let n = Decimal::from(n);
    let rem = Decimal::from(rem);
    Ok(n + rem
        .checked_div(Decimal::from(10).powi(decimals as i64))
        .ok_or(Error::CheckedDivOverflow)?)
}

fn decimal_to_u256(n: Decimal, decimals: u8) -> R<U256> {
    if n.is_zero() {
        return Ok(U256::ZERO);
    }
    assert_or!(n.is_sign_positive(), Error::NegativeFixedToUintConv);
    let q = U256::from(n.to_u128().unwrap());
    let r = U256::from(
        n.checked_rem(Decimal::from(1))
            .ok_or(Error::CheckedMulOverflow)?
            .checked_mul(Decimal::from(10).powi(decimals as i64))
            .ok_or(Error::CheckedMulOverflow)?
            .to_u128()
            .ok_or(Error::CheckedMulOverflow)?,
    );
    Ok(q * U256::from(10).pow(U256::from(decimals)) + r)
}

pub fn share_decimal_to_u256(x: Decimal) -> R<U256> {
    decimal_to_u256(x, SHARE_DECIMALS)
}
pub fn share_u256_to_decimal(x: U256) -> R<Decimal> {
    u256_to_decimal(x, SHARE_DECIMALS)
}

pub fn fusdc_decimal_to_u256(x: Decimal) -> R<U256> {
    decimal_to_u256(x, FUSDC_DECIMALS)
}
pub fn fusdc_u256_to_decimal(x: U256) -> R<Decimal> {
    u256_to_decimal(x, FUSDC_DECIMALS)
}

#[macro_export]
macro_rules! assert_eq_f {
    ($left:expr, $right:expr $(,)?) => {
        match (&$left, &$right) {
            (left_val, right_val) => {
                let right_val_add = right_val + (right_val * rust_decimal_macros::dec!(1e-4));
                // !(left_val <= (right_val + right_val * 0.00001))
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

#[cfg(all(test, not(target_arch = "wasm32")))]
mod proptesting {
    use super::*;

    use proptest::prelude::*;

    use stylus_sdk::alloy_primitives::U256;

    proptest! {
        #[test]
        fn test_decoding_to_and_from(
            x in 1..i64::MAX
        ) {
            let d = 6;
            let n = U256::from(x);
            let res = decimal_to_u256(u256_to_decimal(n, d).unwrap(), d).unwrap();
            assert!(res == n, "res: {res} == {n}");
        }
    }
}
