use stylus_sdk::alloy_primitives::{aliases::*, *};

use crate::error::*;

pub use crate::storage_trading::*;

#[cfg_attr(feature = "contract-trading-price", stylus_sdk::prelude::public)]
impl StorageTrading {
    #[allow(clippy::too_many_arguments)]
    #[allow(non_snake_case)]
    pub fn price_A_827_E_D_27(&self, id: FixedBytes<8>) -> R<U256> {
        if !self.when_decided.is_zero() {
            return Ok(U256::ZERO);
        }
        self.internal_dpm_price(id)
    }
}
