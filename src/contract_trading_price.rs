use stylus_sdk::alloy_primitives::{aliases::*, *};

use crate::error::*;

#[cfg(feature = "contract-trading-price")]
use alloc::vec::Vec;

pub use crate::{storage_trading::*, utils::msg_sender};

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
    pub fn claim_all_fees_71949_E_C_8(&mut self, _recipient: Address) -> R<U256> {
        #[cfg(feature = "trading-backend-dpm")]
        return Err(Error::AMMOnly);
        #[cfg(not(feature = "trading-backend-dpm"))]
        self.internal_amm_claim_all_fees(_recipient)
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
        if self.is_not_done_predicting() {
            assert_or!(_amount_liq > U256::ZERO, Error::ZeroShares);
            assert_or!(
                self.amm_user_liquidity_shares.get(msg_sender()) >= _amount_liq,
                Error::NotEnoughLiquidity
            );
            let (fusdc_amt, fees_earned, _) =
                self.internal_amm_remove_liquidity(_amount_liq, _recipient)?;
            fusdc_call::transfer(_recipient, fusdc_amt)?;
            Ok((fusdc_amt, fees_earned))
        } else {
            Ok((
                self.internal_amm_claim_liquidity(msg_sender(), _amount_liq, _recipient)?,
                self.internal_amm_claim_lp_fees(msg_sender(), _recipient)?,
            ))
        }
    }
}

#[cfg(not(target_arch = "wasm32"))]
#[mutants::skip]
impl StorageTrading {
    /// Testing function that returns more than the deployed equivalent,
    /// including the shares, though lacking in permit features.
    pub fn add_liquidity_test(
        &mut self,
        _amount: U256,
        _recipient: Address,
    ) -> R<(U256, Vec<(FixedBytes<8>, U256)>)> {
        c!(fusdc_call::take_from_sender(_amount));
        self.internal_amm_add_liquidity(_amount, _recipient)
    }

    // Almost a carbon copy of the equivalent, though this returns the shares
    /// as well.
    pub fn remove_liquidity_test(
        &mut self,
        _amount_liq: U256,
        _recipient: Address,
    ) -> R<(U256, U256, Vec<(FixedBytes<8>, U256)>)> {
        self.require_not_done_predicting()?;
        assert_or!(_amount_liq > U256::ZERO, Error::ZeroShares);
        assert_or!(
            self.amm_user_liquidity_shares.get(msg_sender()) >= _amount_liq,
            Error::NotEnoughLiquidity
        );
        let (fusdc_amt, fees_earned, shares) =
            self.internal_amm_remove_liquidity(_amount_liq, _recipient)?;
        fusdc_call::transfer(_recipient, fusdc_amt)?;
        Ok((fusdc_amt, fees_earned, shares))
    }
}
