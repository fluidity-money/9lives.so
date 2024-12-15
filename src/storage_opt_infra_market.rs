use stylus_sdk::{alloy_primitives::*, storage::*};

#[cfg_attr(
    any(
        feature = "contract-infra-market-predict",
        feature = "contract-infra-market-sweep",
        feature = "contract-infra-market-extras",
        feature = "testing"
    ),
    stylus_sdk::prelude::storage
)]
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

    /// Voting power vested globally in the different outcomes cumulative
    /// that's created with a decay function. Used to determine the winner
    /// of this infrastructure campaign.
    pub campaign_global_power_vested: StorageU256,

    /// Market power calculated by the decaying function vested into
    /// these outcomes.
    /// outcome => power
    pub outcome_vested_power: StorageMap<FixedBytes<8>, StorageU256>,

    /// Vested market power that we tracked that users supplied across each
    /// outcome. Once we've determined the winner, we can share of the share
    /// of the winning power amount relative to the market power invested
    /// globally to find the percent we must dilute user global power down by.
    /// We use this information to allow victims to be slashed by predictors
    /// who had a share of the winning outcome that exceeded the victim's.
    pub user_global_vested_power: StorageMap<Address, StorageU256>,

    /// Outcome specific user power voting. This is needed to
    /// determine the share that the caller to the sweeping function had
    /// in the winning pool relative to others, to determine if their
    /// share is greater than the share that the user that is being
    /// slashed invested globally. To protect users who bet partly
    /// incorrectly but bet more in the correct outcome, we also use this
    /// function to determine if the power they bet in the winning outcome
    /// is more than half of their share.
    //outcome => user => power
    pub user_outcome_vested_power: StorageMap<FixedBytes<8>, StorageMap<Address, StorageU256>>,

    /// ARB invested by a user into the infra market for a specific Trading contract.
    pub user_global_vested_arb: StorageMap<Address, StorageU256>,

    /// The amount of Staked ARB that was vested in this outcome by everyone.
    pub outcome_vested_arb: StorageMap<FixedBytes<8>, StorageU256>,

    /// Was the campaign winner set?
    pub campaign_winner_set: StorageBool,

    /// Was a winner determined?
    pub campaign_winner: StorageFixedBytes<8>,

    /// What outcome did the original caller of this market declare as the winner?
    pub campaign_what_called: StorageFixedBytes<8>,

    /// Addresses of users who "called" the campaign outcome, before the
    /// 3 day contest window begins.
    pub campaign_who_called: StorageAddress,

    /// When someone "called" this contract, taking it out of the optimistic
    /// state period into the whinging stage.
    pub campaign_when_called: StorageU64,
}

#[cfg_attr(
    any(
        feature = "contract-infra-market-predict",
        feature = "contract-infra-market-sweep",
        feature = "contract-infra-market-extras",
        feature = "testing"
    ),
    stylus_sdk::prelude::storage
)]
#[cfg_attr(
    any(
        feature = "contract-infra-market-predict",
        feature = "contract-infra-market-sweep",
        feature = "contract-infra-market-extras"
    ),
    stylus_sdk::prelude::entrypoint
)]
pub struct StorageOptimisticInfraMarket {
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

    /// If we have a situation where there's no liquidity that declares a winner (or
    /// it's the kind of contract where things can just expire), who do we pick?
    pub campaign_default_winner: StorageMap<Address, StorageFixedBytes<8>>,

    /// The current nonce of this market. This is set to 0 at the beginning of the
    /// contract's life. This is used in the event that a reset has taken place with
    /// the epochs system.
    pub cur_epochs: StorageMap<Address, StorageU256>,

    /// Epoch-specific info for a campaign.
    pub epochs: StorageMap<Address, StorageMap<U256, StorageEpochDetails>>,
}

#[cfg(feature = "testing")]
impl crate::host::StorageNew for StorageOptimisticInfraMarket {
    fn new(i: U256, v: u8) -> Self {
        unsafe { <Self as StorageType>::new(i, v) }
    }
}
