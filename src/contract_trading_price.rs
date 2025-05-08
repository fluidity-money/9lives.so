use stylus_sdk::alloy_primitives::{aliases::*, *};

use crate::error::*;

pub use crate::{storage_trading::*, utils::msg_sender};

#[cfg(feature = "contract-trading-price")]
use alloc::vec::Vec;

#[cfg(not(feature = "trading-backend-dpm"))]
use crate::fusdc_call;

#[cfg_attr(feature = "contract-trading-price", stylus_sdk::prelude::public)]
impl StorageTrading {
    #[allow(clippy::too_many_arguments)]
    #[allow(non_snake_case)]
    pub fn price_A_827_E_D_27(&mut self, id: FixedBytes<8>) -> R<U256> {
        if !self.when_decided.get().is_zero() {
            return Ok(U256::ZERO);
        }
        #[cfg(feature = "trading-backend-dpm")]
        return self.internal_dpm_price(id);
        #[cfg(not(feature = "trading-backend-dpm"))]
        return self.internal_amm_price(id);
    }

    #[allow(clippy::too_many_arguments)]
    #[allow(non_snake_case)]
    pub fn claim_liquidity_9_C_391_F_85(&mut self, _recipient: Address) -> R<U256> {
        #[cfg(not(feature = "trading-backend-dpm"))]
        return self.internal_amm_claim_liquidity(_recipient);
        #[cfg(feature = "trading-backend-dpm")]
        return Err(Error::AMMOnly);
    }

    #[allow(clippy::too_many_arguments)]
    #[allow(non_snake_case)]
    pub fn claim_lp_fees_66980_F_36(&mut self, _recipient: Address) -> R<U256> {
        #[cfg(feature = "trading-backend-dpm")]
        return Err(Error::AMMOnly);
        #[cfg(not(feature = "trading-backend-dpm"))]
        self.internal_amm_claim_lp_fees(_recipient)
    }

    #[allow(non_snake_case)]
    pub fn add_liquidity_A_975_D_995(&mut self, _amount: U256, _recipient: Address) -> R<U256> {
        #[cfg(feature = "trading-backend-dpm")]
        return Err(Error::AMMOnly);
        #[cfg(not(feature = "trading-backend-dpm"))]
        return {
            c!(fusdc_call::take_from_sender(_amount));
            let (shares, _) = self.internal_amm_add_liquidity(_amount, _recipient)?;
            Ok(shares)
        };
    }

    #[allow(clippy::too_many_arguments)]
    #[allow(non_snake_case)]
    pub fn remove_liquidity_3_C_857_A_15(
        &mut self,
        _amount_liq: U256,
        _recipient: Address,
    ) -> R<(U256, U256)> {
        #[cfg(feature = "trading-backend-dpm")]
        return Err(Error::AMMOnly);
        #[cfg(not(feature = "trading-backend-dpm"))]
        return {
            self.require_not_done_predicting()?;
            assert_or!(!_amount_liq.is_zero(), Error::ZeroShares);
            assert_or!(
                self.amm_user_liquidity_shares.get(msg_sender()) >= _amount_liq,
                Error::NotEnoughLiquidity
            );
            let (fusdc_amt, fees_earned, _) =
                self.internal_amm_remove_liquidity(_amount_liq, _recipient)?;
            fusdc_call::transfer(_recipient, fusdc_amt)?;
            Ok((fusdc_amt, fees_earned))
        };
    }
}
