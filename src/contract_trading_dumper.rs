#[cfg(all(feature = "contract-trading-dumper",))]
use stylus_sdk::{alloy_primitives::*, block};

use alloc::{format, string::String, string::ToString, vec::Vec};

use crate::{fees::*, fusdc_call, proxy, share_call, storage_trading::*, utils::*};

pub use crate::storage_trading::*;

use core::fmt::{write, Write};

#[stylus_sdk::prelude::public]
impl StorageTrading {
    pub fn dump_state(&self) -> String {
        let bn = block::number();
        let addr = contract_address();
        let outcome_len = self.outcome_list.len();
        let when_decided = self.when_decided.get();
        let is_shutdown = self.is_shutdown.get();
        let winner = self.winner.get();
        let is_protocol_fee_disabled = self.is_protocol_fee_disabled.get();
        let fee = (if is_protocol_fee_disabled {
            U256::ZERO
        } else {
            FEE_SPN_MINT_PCT
        }) * U256::from(10);
        let amm_liquidity = self.amm_liquidity.get();
        let amm_fees_collected_weighted = self.amm_fees_collected_weighted.get();
        let amm_lp_global_fees_claimed = self.amm_lp_global_fees_claimed.get();
        let outcome_prices = self
            .outcome_ids_iter()
            .map(|x| self.amm_outcome_prices.get(x).to_string())
            .collect::<Vec<_>>()
            .join(", ");
        let shares = self
            .outcome_ids_iter()
            .map(|x| self.amm_shares.get(x).to_string())
            .collect::<Vec<_>>()
            .join(", ");
        let total_shares = self
            .outcome_ids_iter()
            .map(|x| self.amm_total_shares.get(x).to_string())
            .collect::<Vec<_>>()
            .join(", ");
        let sender = msg_sender();
        let mut user_outcome_shares = String::new();
        for (i, outcome_id) in self.outcome_ids_iter().enumerate() {
            let share_addr = proxy::get_share_addr(
                self.factory_addr.get(),
                contract_address(),
                self.share_impl.get(),
                outcome_id,
            );
            let bal = share_call::balance_of(share_addr, sender).unwrap();
            if bal.is_zero() {
                continue;
            }
            write!(
                &mut user_outcome_shares,
                "    market.user_outcome_shares[\"Alice\"][{i}] = {bal}\n"
            )
            .unwrap();
        }
        let user_liquidity_shares = self.amm_user_liquidity_shares.get(sender);
        let usd_bal_contract = fusdc_call::balance_of(contract_address()).unwrap();
        let usd_bal_sender = fusdc_call::balance_of(sender).unwrap();
        format!(
            r#"
def simulate_market_{addr}_{bn}():
    market = PredMarketNew(liquidity={amm_liquidity}, outcomes={outcome_len}, fees={fee})
    market.outcome_prices = [{outcome_prices}]
    market.shares = [{shares}]
    market.total_shares = [{total_shares}]
    market.user_outcome_shares["Alice"] = [0] * {outcome_len}
{user_outcome_shares}    market.user_liquidity_shares["Alice"] = {user_liquidity_shares}
    market.user_wallet_usd["Alice"] = {usd_bal_sender}
    market.pool_wallet_usd = {usd_bal_contract}
    market.fees_collected_weighted = {amm_fees_collected_weighted}
    market.fees_claimed["Alice"] = {amm_lp_global_fees_claimed}
"#
        )
    }
}
