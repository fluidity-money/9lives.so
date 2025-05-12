use const_hex::ToHexExt;

use stylus_sdk::block;

use alloc::{format, string::String, string::ToString, vec::Vec};

use crate::{error::*, fusdc_call, proxy, share_call, utils::*};

pub use crate::storage_trading::*;

use core::fmt::Write;

#[cfg_attr(feature = "contract-trading-dumper", stylus_sdk::prelude::public)]
impl StorageTrading {
    pub fn dump_state(&self) -> R<String> {
        let bn = block::number();
        let addr = contract_address();
        let outcome_len = self.outcome_list.len();
        let is_protocol_fee_disabled = self.is_protocol_fee_disabled.get();
        let fee_creator = self.fee_creator.get();
        let fee_minter = self.fee_minter.get();
        let fee_lp = self.fee_lp.get();
        let fee_referrer = self.fee_referrer.get();
        let amm_liquidity = self.amm_liquidity.get();
        let amm_fees_collected_weighted = self.amm_fees_collected_weighted.get();
        let amm_lp_global_fees_claimed = self.amm_lp_global_fees_claimed.get();
        let amm_lp_user_fees_claimed = self.amm_lp_user_fees_claimed.get(msg_sender());
        let rust_outcomes = self
            .outcome_ids_iter()
            .map(|x| format!("fixed_bytes!(\"{}\")", x.encode_hex()))
            .collect::<Vec<_>>()
            .join(", ");
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
            let bal = share_call::balance_of(share_addr, sender)?;
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
        let usd_bal_contract = fusdc_call::balance_of(contract_address())?;
        let usd_bal_sender = fusdc_call::balance_of(sender)?;
        let mut rust_amm_outcome_prices = String::new();
        for outcome_id in self.outcome_ids_iter() {
            write!(
                &mut rust_amm_outcome_prices,
                "            c.amm_outcome_prices.setter(fixed_bytes!(\"{}\")).set(U256::from({}));\n",
                outcome_id.encode_hex(),
                self.amm_outcome_prices.get(outcome_id)
            )
            .unwrap();
        }
        let mut rust_amm_shares = String::new();
        for outcome_id in self.outcome_ids_iter() {
            write!(
                &mut rust_amm_shares,
                "            c.amm_shares.setter(fixed_bytes!(\"{}\")).set(U256::from({}));\n",
                outcome_id.encode_hex(),
                self.amm_shares.get(outcome_id)
            )
            .unwrap();
        }
        let mut rust_amm_shares = String::new();
        for outcome_id in self.outcome_ids_iter() {
            write!(
                &mut rust_amm_shares,
                "            c.amm_shares.setter(fixed_bytes!(\"{}\")).set(U256::from({}));\n",
                outcome_id.encode_hex(),
                self.amm_shares.get(outcome_id)
            )
            .unwrap();
        }
        let mut rust_amm_total_shares = String::new();
        for outcome_id in self.outcome_ids_iter() {
            write!(
                &mut rust_amm_total_shares,
                "            c.amm_total_shares.setter(fixed_bytes!(\"{}\")).set(U256::from({}));\n",
                outcome_id.encode_hex(),
                self.amm_total_shares.get(outcome_id)
            )
            .unwrap();
        }
        Ok(format!(
            r#"
// NOTE: we don't make any assumptions about the winner, or whether this
// market has concluded. We also don't track the fees owed with the other
// fee structures.

def simulate_market_{addr}_{bn}():
    # Note that fees are explicitly disabled!
    market = PredMarketNew(liquidity={amm_liquidity}, outcomes={outcome_len}, fees=0)
    market.outcome_prices = [{outcome_prices}]
    market.shares = [{shares}]
    market.total_shares = [{total_shares}]
    market.user_outcome_shares["Alice"] = [0] * {outcome_len}
{user_outcome_shares}    market.user_liquidity_shares["Alice"] = {user_liquidity_shares}
    market.user_wallet_usd["Alice"] = {usd_bal_sender}
    market.pool_wallet_usd = {usd_bal_contract}
    market.fees_collected_weighted = {amm_fees_collected_weighted}
    market.fees_claimed["Alice"] = {amm_lp_user_fees_claimed}

#[test]
fn test_amm_reproduction_{addr}_{bn}() {{
    let outcomes = [{rust_outcomes}];
    interactions_clear_after! {{
        IVAN => {{
            let mut c = StorageTrading::default();
            setup_contract!(&mut c, &outcomes);
            //c.fee_creator.set(U256::from({fee_creator}));
            //c.fee_minter.set(U256::from({fee_minter}));
            //c.fee_lp.set(U256::from({fee_lp}));
            //c.fee_referrer.set(U256::from({fee_referrer}));
            c.is_protocol_fee_disabled.set(true); // Disabled by the generator!
            //c.is_protocol_fee_disabled.set({is_protocol_fee_disabled});
            c.amm_liquidity.set(U256::from({amm_liquidity}));
{rust_amm_outcome_prices}{rust_amm_shares}{rust_amm_total_shares}            c.amm_user_liquidity_shares.setter(msg_sender()).set(U256::from({user_liquidity_shares}));
            c.amm_fees_collected_weighted.set(U256::from({amm_fees_collected_weighted}));
            c.amm_lp_global_fees_claimed.set(U256::from({amm_lp_global_fees_claimed}));
            c.amm_lp_user_fees_claimed.setter(msg_sender()).set(U256::from({amm_lp_user_fees_claimed}));
        }}
    }}
}}
"#
        ))
    }
}
