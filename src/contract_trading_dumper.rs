use crate::{storage_trading::*, log_txt};

use hashbrown::{DefaultHashBuilder, HashMap};

use alloc::{format, string::String};

macro_rules! tblify {
    ($tbl:ident, $self:ident, { $($field:ident),* $(,)? }) => {
        $(
            $tbl.insert(stringify!($field), format!("{}", $self.$field.get()));
        )*
    };
}

#[cfg_attr(feature = "contract-trading-dumper", stylus_sdk::prelude::public)]
impl StorageTrading {
    pub fn dump_state(&self) {
        // Start by dumping each variable that's not a complex storage.
        let mut tbl = HashMap::with_hasher(DefaultHashBuilder::build_hasher());
        tblify!(tbl, self, {
            created,
            factory_addr,
            when_decided,
            is_shutdown,
            fee_recipient,
            time_start,
            time_ending,
            oracle,
            share_impl,
            winner,
            should_buffer_time,
            operator,
            fee_creator,
            fee_minter,
            fee_lp,
            fee_referrer,
            is_escaped,
            is_protocol_fee_disabled,
            dpm_global_shares,
            dpm_global_invested,
            amm_liquidity,
            amm_fees_collected_weighted,
            amm_lp_global_fees_claimed,
        });
    }
}
