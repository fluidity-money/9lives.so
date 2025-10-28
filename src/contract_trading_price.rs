use stylus_sdk::alloy_primitives::{aliases::*, *};

use crate::error::*;

#[cfg(feature = "contract-trading-price")]
use alloc::vec::Vec;

pub use crate::{immutables, immutables::DAO_EARN_ADDR, storage_trading::*, utils::msg_sender};

#[cfg(not(feature = "trading-backend-dppm"))]
use crate::fusdc_call;

#[cfg_attr(feature = "contract-trading-price", stylus_sdk::prelude::public)]
impl StorageTrading {
    #[allow(clippy::too_many_arguments)]
    #[allow(non_snake_case)]
    pub fn price_A_827_E_D_27(&mut self, id: FixedBytes<8>) -> R<U256> {
        if !self.when_decided.get().is_zero() {
            return Ok(U256::ZERO);
        }
        #[cfg(feature = "trading-backend-dppm")]
        return self.internal_dppm_price(id);
        #[cfg(not(feature = "trading-backend-dppm"))]
        return self.internal_amm_price(id);
    }

    #[allow(clippy::too_many_arguments)]
    #[allow(non_snake_case)]
    pub fn claim_all_fees_332_D_7968(&mut self, _recipient: Address) -> R<U256> {
        return self.internal_claim_all_fees(
            match msg_sender() {
                immutables::DAO_OP_ADDR => {
                    assert_or!(_recipient == DAO_EARN_ADDR, Error::IncorrectDAOClaiming);
                    DAO_EARN_ADDR
                }
                immutables::CLAIMANT_HELPER | immutables::PAYMASTER_ADDR => _recipient,
                sender => sender,
            },
            _recipient,
        );
    }

    #[allow(non_snake_case)]
    pub fn add_liquidity_B_9_D_D_A_952(
        &mut self,
        _amount: U256,
        _recipient: Address,
        _min_liquidity: U256,
        _max_liquidity: U256,
    ) -> R<U256> {
        #[cfg(feature = "trading-backend-dppm")]
        return Err(Error::AMMOnly);
        #[cfg(not(feature = "trading-backend-dppm"))]
        return {
            c!(fusdc_call::take_from_sender(_amount));
            let (shares, _) =
                self.internal_amm_add_liquidity(_amount, _recipient, _min_liquidity)?;
            assert_or!(shares <= _max_liquidity, Error::TooMuchLiquidityTaken);
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
        #[cfg(feature = "trading-backend-dppm")]
        return Err(Error::AMMOnly);
        #[cfg(not(feature = "trading-backend-dppm"))]
        {
            let sender = if msg_sender() == immutables::PAYMASTER_ADDR {
                _recipient
            } else {
                msg_sender()
            };
            if self.is_not_done_predicting() {
                assert_or!(
                    self.amm_user_liquidity_shares.get(sender) >= _amount_liq,
                    Error::NotEnoughLiquidity
                );
                let (fusdc_amt, fees_earned, _) =
                    self.internal_amm_remove_liquidity(_amount_liq, _recipient)?;
                fusdc_call::transfer(_recipient, fusdc_amt)?;
                Ok((fusdc_amt, fees_earned))
            } else {
                let fees = self.internal_claim_all_fees(sender, _recipient)?;
                Ok((
                    self.internal_amm_claim_liquidity(sender, _amount_liq, _recipient)?,
                    fees,
                ))
            }
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
        c!(crate::fusdc_call::take_from_sender(_amount));
        self.internal_amm_add_liquidity(_amount, _recipient, U256::ZERO)
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
        crate::fusdc_call::transfer(_recipient, fusdc_amt)?;
        Ok((fusdc_amt, fees_earned, shares))
    }
}
