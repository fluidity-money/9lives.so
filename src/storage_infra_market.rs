use stylus_sdk::{alloy_primitives::*, storage::*};

#[stylus_sdk::prelude::storage]
pub struct StorageEpochDetails {
    /// When did someone whinge about the called outcome?
    pub campaign_when_whinged: StorageU64,

    /// Which outcome does the whinger prefer? Needed to refund their bond
    /// or, in the event of a close call in the predict stage, used to tip the scales to
    /// this preferred outcome.
    pub campaign_whinger_preferred_winner: StorageFixedBytes<8>,

    /// Who whinged about this outcome? We track them so as to return
    /// their bond if they're correct, plus the caller incentive amount.
    pub campaign_who_whinged: StorageAddress,

    /// What the user's commitment is for this round.
    pub commitments: StorageMap<Address, StorageFixedBytes<32>>,

    /// Which outcome a user's commitment reveal turned out to be.
    pub reveals: StorageMap<Address, StorageFixedBytes<8>>,

    /// The amount of ARB vested globally in every outcome.
    pub global_vested_arb: StorageU256,

    /// The amount of Staked ARB that was vested in this outcome by everyone.
    pub outcome_vested_arb: StorageMap<FixedBytes<8>, StorageU256>,

    /// The amount a specific user vested in ARB to the outcome they want.
    /// We use this to work with the slashing behaviour later to prevent
    /// double slashing.
    pub user_vested_arb: StorageMap<Address, StorageU256>,

    /// Was the campaign winner set?
    pub campaign_winner_set: StorageBool,

    /// Was a winner determined?
    pub campaign_winner: StorageFixedBytes<8>,

    /// Addresses of users who "called" the campaign outcome, before the
    /// contest window begins.
    pub campaign_who_called: StorageAddress,

    /// Which outcome was called by the caller.
    pub campaign_what_called: StorageFixedBytes<8>,

    /// When someone "called" this contract, taking it out of the optimistic
    /// state period into the whinging stage.
    pub campaign_when_called: StorageU64,

    /// The "Pot" that can be redeemed from by the correct bettors in this
    /// market. This is the amount that was tracked as available, so we can
    /// check the amount that they should receive based on their percentage
    /// from the amount outstanding instead of infinitely drawing it down.
    pub redeemable_pot_existing: StorageU256,

    /// The "Pot" that's outstanding in this market. The amount that should be
    /// decreased gradually per take from the pool.
    pub redeemable_pot_outstanding: StorageU256,

    /// Whether the user has claimed their outstanding share of the pool.
    pub redeemable_user_has_claimed: StorageMap<Address, StorageBool>,
}

#[cfg_attr(
    any(
        feature = "contract-infra-market",
        feature = "contract-infra-market-testing",
        feature = "testing"
    ),
    stylus_sdk::prelude::storage
)]
#[cfg_attr(
    any(
        feature = "contract-infra-market",
        feature = "contract-infra-market-testing"
    ),
    stylus_sdk::prelude::entrypoint
)]
pub struct StorageInfraMarket {
    /// Was this contract created successfully?
    pub created: StorageBool,

    /// Is the contract enabled? Did an emergency take place?
    pub enabled: StorageBool,

    /// The Operator of this contract, able to "rake" amounts.
    pub operator: StorageAddress,

    /// The incentive amounts/fees taken in this contract. This could be useful
    /// for collecting from the allocations provided. The operator should
    /// take care not to charge more than what's needed to pay operators
    /// of the contract. Perhaps some buffer is needed to be cautious.
    pub dao_money: StorageU256,

    /// Emergency address for this contract.
    pub emergency_council: StorageAddress,

    /// Address of the lockup contract. This is needed to request slashing.
    pub lockup_addr: StorageAddress,

    /// Locked ARB token that we query the balance of at the creation
    /// of the campaign with.
    pub locked_arb_token_addr: StorageAddress,

    /// Factory address that's allowed to call this contract to create new
    /// campaigns.
    pub factory_addr: StorageAddress,

    /// Currently outstanding campaign call timestamps. This period is a
    /// time when anyone can call the contract to "call" the outcome, and which
    /// immediately follows a "grace" period of a day.
    pub campaign_call_begins: StorageMap<Address, StorageU64>,

    /// Market description. This should be keccak256(any string). This
    /// is used to figure out how this should resolve. This should be checked
    /// off-chain to find where data was stored (at the expense of some centralisation
    /// with the current system).
    pub campaign_desc: StorageMap<Address, StorageB256>,

    /// If the campaign has been in a state of being callable for some time,
    /// this is the deadline for calling to complete. If this is exceeded,
    /// then we begin a stage where the safety net is able to be activated,
    /// with the Escape Hatch functionality. In this situation, the oracle
    /// notifies the Trading contract that it's not possible for this oracle
    /// to resolve, and funds need to be rescued.
    pub campaign_call_deadline: StorageMap<Address, StorageU64>,

    /// The campaign is in an indeterminate state, and the associated Trading contract
    /// has been called.
    pub campaign_has_escaped: StorageMap<Address, StorageBool>,

    /// The current nonce of this market. This is set to 0 at the beginning of the
    /// contract's life. This is used in the event that a reset has taken place with
    /// the epochs system.
    pub cur_epochs: StorageMap<Address, StorageU256>,

    /// Epoch-specific info for a campaign.
    pub epochs: StorageMap<Address, StorageMap<U256, StorageEpochDetails>>,
}

#[cfg(feature = "testing")]
impl crate::host::StorageNew for StorageInfraMarket {
    fn new(i: U256, v: u8) -> Self {
        unsafe { <Self as StorageType>::new(i, v) }
    }
}

#[cfg(not(target_arch = "wasm32"))]
impl std::fmt::Debug for StorageInfraMarket {
    fn fmt(&self, f: &mut std::fmt::Formatter) -> Result<(), std::fmt::Error> {
        write!(
            f,
            "StorageInfraMarket {{ {:?}, {:?}, {:?}, {:?}, {:?}, {:?}, {:?}, .. }}",
            self.created,
            self.enabled,
            self.operator,
            self.dao_money,
            self.emergency_council,
            self.lockup_addr,
            self.factory_addr,
        )
    }
}

#[cfg(all(feature = "testing", not(target_arch = "wasm32")))]
pub fn strat_storage_infra_market() -> impl proptest::prelude::Strategy<Value = StorageInfraMarket>
{
    use crate::{
        storage_set_fields,
        utils::{strat_large_u256},
    };
    use proptest::prelude::*;
    (
        strat_large_u256().no_shrink(), // Storage offset
        any::<bool>(),
        any::<bool>(),
        any::<Address>(),
        strat_large_u256(),
        any::<Address>(),
        any::<Address>(),
        any::<Address>(),
    )
        .prop_map(
            |(
                i,
                created,
                enabled,
                operator,
                dao_money,
                emergency_council,
                lockup_addr,
                factory_addr,
            )| {
                storage_set_fields!(StorageInfraMarket, i, {
                    created,
                    enabled,
                    operator,
                    dao_money,
                    emergency_council,
                    lockup_addr,
                    factory_addr
                })
            },
        )
}
