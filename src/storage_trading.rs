use stylus_sdk::{alloy_primitives::*, storage::*};

#[cfg_attr(
    any(
        feature = "contract-trading-mint",
        feature = "contract-trading-extras",
        feature = "contract-trading-quotes",
        feature = "contract-trading-price",
        feature = "testing"
    ),
    stylus_sdk::prelude::storage
)]
#[cfg_attr(
    any(
        feature = "contract-trading-mint",
        feature = "contract-trading-extras",
        feature = "contract-trading-quotes",
        feature = "contract-trading-price"
    ),
    stylus_sdk::prelude::entrypoint
)]
pub struct StorageTrading {
    /// Was this contract created?
    pub created: StorageBool,

    /// The address of the factory.
    pub factory_addr: StorageAddress,

    /// Outcome was determined! It should be impossible to mint, only to burn.
    /// This is the timestamp the locking took place. If it's 0, then we haven't
    /// decided the outcome yet.
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

    /// Shares invested in every outcome cumulatively. NOT IN USE BY THE
    /// AMM.
    pub global_shares: StorageU256,

    /// Shares available to buy in the pool.
    pub outcome_shares: StorageMap<FixedBytes<8>, StorageU256>,

    /// Shares that're in the pool that have been bought.
    pub outcome_total_shares: StorageMap<FixedBytes<8>, StorageU256>,

    /// Amount that was invested to seed this pool. Used as liquidity by the AMM.
    pub seed_invested: StorageU256,

    /// Global amount invested to this pool of the native asset.
    pub global_invested: StorageU256,

    /// The amount invested in a specific outcome.
    pub outcome_invested: StorageMap<FixedBytes<8>, StorageU256>,

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

    /// The current mint fee for the creator.
    pub fee_creator: StorageU256,

    /// The current mint fee for the operator.
    pub fee_operator: StorageU256,

    /// The current mint fee for position holders (users) who participated
    /// in the campaign.
    pub fee_minter: StorageU256,
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
            self.global_shares,
            self.seed_invested,
            self.global_invested,
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
            move |(oracle, share_impl, seed_invested, outcomes, should_buffer_time)| {
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
                                seed_invested,
                                should_buffer_time
                            });
                            // Set this using the outcomes vec so we can be internally consistent.
                            // We don't enforce consistency with the seed invested argument. That
                            // might warrant more fine-grained use of this storage (and functions
                            // associated).
                            let mut global_invested = U256::ZERO;
                            let mut global_shares = U256::ZERO;
                            for (outcome_id, outcome_shares, outcome_invested) in &outcomes {
                                c.outcome_invested
                                    .setter(*outcome_id)
                                    .set(*outcome_invested);
                                c.outcome_shares.setter(*outcome_id).set(*outcome_shares);
                                global_invested += outcome_invested;
                                global_shares += outcome_shares;
                                c.outcome_list.push(*outcome_id);
                            }
                            c.global_shares.set(global_shares);
                            c.global_invested.set(global_invested);
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
