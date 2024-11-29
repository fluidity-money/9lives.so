use stylus_sdk::{alloy_primitives::*, prelude::*, storage::*};

#[storage]
#[cfg_attr(feature = "contract-infrastructure-market", entrypoint)]
pub struct StorageOptimisticInfraMarket {
    /// Was this contract created successfully?
    pub created: StorageBool,

    /// Is the contract enabled? Did an emergency take place?
    pub enabled: StorageBool,

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

    /// Addresses of users who "called" the campaign outcome, before the
    /// 3 day contest window begins.
    pub campaign_who_called: StorageMap<Address, StorageAddress>,

    /// When someone "called" this contract, taking it out of the optimistic
    /// state period into the whinging stage.
    pub campaign_when_called: StorageMap<Address, StorageU64>,

    /// If we have a situation where there's no liquidity that declares a winner (or
    /// it's the kind of contract where things can just expire), who do we pick?
    pub campaign_default_winner: StorageMap<Address, StorageFixedBytes<8>>,

    /// What outcome did the original caller of this market declare as the winner?
    pub campaign_what_called: StorageMap<Address, StorageFixedBytes<8>>,

    /// When did someone whinge about the called outcome?
    pub campaign_when_whinged: StorageMap<Address, StorageU64>,

    /// Which outcome does the whinger prefer? Needed to refund their bond
    /// or, in the event of a close call in the predict stage, used to tip the scales to
    /// this preferred outcome.
    pub campaign_whinger_preferred_winner: StorageMap<Address, StorageFixedBytes<8>>,

    /// Who whinged about this outcome? We track them so as to return
    /// their bond if they're correct, plus the caller incentive amount.
    pub campaign_who_whinged: StorageMap<Address, StorageAddress>,

    /// Market description. This should be keccak256(<(url committee|beauty contest)>:<description>). This is used to figure out how this should resolve.
    pub campaign_desc: StorageMap<Address, StorageB256>,

    /// Voting power vested globally in the different outcomes cumulative
    /// that's created with a decay function. Used to determine the winner
    /// of this infrastructure campaign.
    /// trading => power
    pub campaign_global_power_vested: StorageMap<Address, StorageU256>,

    /// Market power calculated by the decaying function vested into
    /// these outcomes.
    /// trading => outcome => power
    pub campaign_vested_power: StorageMap<Address, StorageMap<FixedBytes<8>, StorageU256>>,

    /// Vested market power that we tracked that users supplied across each
    /// outcome. Once we've determined the winner, we can share of the share
    /// of the winning power amount relative to the market power invested
    /// globally to find the percent we must dilute user global power down by.
    /// We use this information to allow victims to be slashed by predictors
    /// who had a share of the winning outcome that exceeded the victim's.
    pub user_global_vested_power: StorageMap<Address, StorageMap<Address, StorageU256>>,

    /// Per campaign specific user power voting. This is needed to
    /// determine the share that the caller to the sweeping function had
    /// in the winning pool relative to others, to determine if their
    /// share is greater than the share that the user that is being
    /// slashed invested globally. To protect users who bet partly
    /// incorrectly but bet more in the correct outcome, we also use this
    /// function to determine if the power they bet in the winning outcome
    /// is more than half of their share.
    pub user_campaign_vested_power:
        StorageMap<Address, StorageMap<FixedBytes<8>, StorageMap<Address, StorageU256>>>,

    /// ARB invested by a user into the infra market for a specific Trading contract.
    pub user_global_vested_arb: StorageMap<Address, StorageMap<Address, StorageU256>>,

    /// The amount of Staked ARB that was vested in this outcome by everyone.
    pub campaign_vested_arb: StorageMap<Address, StorageU256>,

    /// Was a winner determined?
    pub campaign_winner: StorageMap<Address, StorageFixedBytes<8>>,
}
