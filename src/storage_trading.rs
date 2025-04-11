use stylus_sdk::{alloy_primitives::*, storage::*, prelude::*};

#[cfg_attr(
    any(
        feature = "contract-trading-mint",
        feature = "contract-trading-extras",
        feature = "contract-trading-quotes",
        feature = "contract-trading-price"
    ),
    stylus_sdk::prelude::entrypoint
)]
#[storage]
pub struct StorageTrading {
    /// Was this contract created?
    pub created: StorageBool,

    /// The address of the factory.
    pub factory_addr: StorageAddress,

    /// Outcome was determined! It should be impossible to mint/burn, only to
    /// trigger payoff. This is the timestamp the locking took place. If it's
    /// 0, then we haven't decided the outcome yet.
    pub when_decided: StorageU64,

    /// Was this contract shut down? This is called once the deadline has
    /// expired to pause trading.
    pub is_shutdown: StorageBool,

    /// The fee recipient of funds.
    pub fee_recipient: StorageAddress,

    /// When the time of trading is possible for this.
    pub time_start: StorageU64,

    /// When the time of trading has ended.
    pub time_ending: StorageU64,

    /// Oracle responsible for determine the outcome.
    pub oracle: StorageAddress,

    /// The recorded share implementation that's needed to reconstruct the
    /// location of the share contract. Stored here to prevent extra calls later
    /// during the construction of this.
    pub share_impl: StorageAddress,

    /// Outcomes tracked to be disabled with Longtail once a winner is found.
    pub outcome_list: StorageVec<StorageFixedBytes<8>>,

    /// The outcome that was chosen to win by the oracle.
    pub winner: StorageFixedBytes<8>,

    /// Whether the contract should extend the deadline by 3 hours if
    /// purchases are made under 3 hours that pass the buffer requirement.
    /// This could be useful in a polling situation.
    pub should_buffer_time: StorageBool,

    /// Operator account that's able to drain funds from this campaign once
    /// it's concluded, as well as set the fee for SPN.
    pub operator: StorageAddress,

    /// The current mint fee for the creator. Defaults to 2 for 0.2%.
    pub fee_creator: StorageU256,

    /// The current mint fee for position holders (users) who participated
    /// in the campaign. Defaults to 8, for 0.8%.
    pub fee_minter: StorageU256,

    /// The fee for LPs to the market. Defaults to 3, for 0.2%.
    pub fee_lp: StorageU256,

    /// An insane situation has taken place, and escaping has happened. This is set
    /// if the developers are able to retrieve the money. This is only possible
    /// to be set by the oracle.
    pub is_escaped: StorageBool,

    /* ~~~~~~~~~~ DPM USED ~~~~~~~~~~ */

    /// Shares invested in every outcome cumulatively.
    pub dpm_global_shares: StorageU256,

    /// Shares available to buy in the pool.
    pub dpm_outcome_shares: StorageMap<FixedBytes<8>, StorageU256>,

    /// Global amount invested to this pool of the native asset.
    pub dpm_global_invested: StorageU256,

    /// The amount invested in a specific outcome.
    pub dpm_outcome_invested: StorageMap<FixedBytes<8>, StorageU256>,

    /* ~~~~~~~~~~ AMM USED ~~~~~~~~~~ */

    pub amm_liquidity: StorageU256,

    pub amm_outcome_prices: StorageMap<FixedBytes<8>, StorageU256>,

    pub amm_shares: StorageMap<FixedBytes<8>, StorageU256>,

    pub amm_total_shares: StorageMap<FixedBytes<8>, StorageU256>,
}

// Storage accessors to simplify lookup.
impl StorageTrading {
    pub fn outcome_ids_iter(&self) -> impl Iterator<Item = FixedBytes<8>> + '_ {
        (0..self.outcome_list.len()).map(|x| self.outcome_list.get(x).unwrap())
    }
}

#[cfg(feature = "testing")]
impl crate::host::StorageNew for StorageTrading {
    fn new(i: U256, v: u8) -> Self {
        unsafe { <Self as StorageType>::new(i, v) }
    }
}

#[cfg(not(target_arch = "wasm32"))]
impl std::fmt::Debug for StorageTrading {
    fn fmt(&self, f: &mut std::fmt::Formatter) -> Result<(), std::fmt::Error> {
        write!(
            f,
            "StorageTrading {{ created: {:?}, factory addr: {:?}, when decided: {:?}, is shutdown: {:?}, fee recipient: {:?}, time start: {:?}, time ending: {:?}, oracle: {:?}, share impl: {:?}, global shares: {:?}, .., seed invested: {:?}, global invested: {:?}, .., winner: {:?}, should buffer time: {:?} }}",
            self.created,
            self.factory_addr,
            self.when_decided,
            self.is_shutdown,
            self.fee_recipient,
            self.time_start,
            self.time_ending,
            self.oracle,
            self.share_impl,
            self.dpm_global_shares,
            self.amm_liquidity,
            self.dpm_global_invested,
            self.winner,
            self.should_buffer_time
        )
    }
}

#[cfg(all(feature = "testing", not(target_arch = "wasm32")))]
pub fn strat_storage_trading(
    should_set_winner: bool,
) -> impl proptest::prelude::Strategy<Value = StorageTrading> {
    use crate::{
        storage_set_fields,
        utils::{
            strat_address, strat_fixed_bytes, strat_large_u256, strat_small_u256, strat_tiny_u256,
        },
    };
    use proptest::prelude::*;
    (
        strat_address(),
        strat_address(),
        strat_small_u256(),
        // We only test two outcomes for now.
        proptest::collection::vec(
            (
                strat_fixed_bytes::<8>(),
                strat_tiny_u256(),
                strat_tiny_u256(),
            ),
            2,
        ),
        any::<bool>(),
    )
        .prop_flat_map(
            move |(oracle, share_impl, amm_liquidity, outcomes, should_buffer_time)| {
                (
                    strat_large_u256().no_shrink(),
                    any::<bool>(),
                    strat_address(),
                    any::<u64>(),
                    any::<bool>(),
                    strat_address(),
                    any::<u64>(),
                    any::<u64>(),
                )
                    .prop_perturb(
                        move |(
                            i,
                            created,
                            factory_addr,
                            when_decided,
                            is_shutdown,
                            fee_recipient,
                            time_start,
                            time_ending,
                        ),
                              mut rng| {
                            let time_start = U64::from(time_start);
                            let time_ending = U64::from(time_ending);
                            let mut c = storage_set_fields!(StorageTrading, i, {
                                created,
                                factory_addr,
                                is_shutdown,
                                fee_recipient,
                                time_start,
                                time_ending,
                                oracle,
                                share_impl,
                                amm_liquidity,
                                should_buffer_time
                            });
                            // Set this using the outcomes vec so we can be internally consistent.
                            // We don't enforce consistency with the seed invested argument. That
                            // might warrant more fine-grained use of this storage (and functions
                            // associated).
                            let mut dpm_global_invested = U256::ZERO;
                            let mut dpm_global_shares = U256::ZERO;
                            for (outcome_id, dpm_outcome_shares, dpm_outcome_invested) in &outcomes {
                                c.dpm_outcome_invested
                                    .setter(*outcome_id)
                                    .set(*dpm_outcome_invested);
                                c.dpm_outcome_shares.setter(*outcome_id).set(*dpm_outcome_shares);
                                dpm_global_invested += dpm_outcome_invested;
                                dpm_global_shares += dpm_outcome_shares;
                                c.outcome_list.push(*outcome_id);
                            }
                            c.dpm_global_shares.set(dpm_global_shares);
                            c.dpm_global_invested.set(dpm_global_invested);
                            if should_set_winner {
                                let i = (rng.next_u64() % outcomes.len() as u64) as usize;
                                c.winner.set(outcomes[i].0);
                                c.when_decided.set(U64::from(when_decided))
                            }
                            c
                        },
                    )
            },
        )
}
