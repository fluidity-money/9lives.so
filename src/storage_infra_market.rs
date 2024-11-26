use stylus_sdk::{alloy_primitives::*, prelude::*, storage::*};

#[storage]
#[cfg_addr(feature = "contract-infra-campaign", entrypoint)]
pub struct StorageInfraMarket {
    /// Was this contract created successfully?
    created: StorageU256,

    /// Is the contract enabled? Did an emergency take place?
    enabled: StorageBool,

    /// Emergency address for this contract.
    emergency_council: Address,

    /// Address of the lockup contract. This is needed to request slashing.
    lockup_addr: StorageAddress,

    /// Locked ARB token that we query the balance of at the creation
    /// of the campaign with.
    locked_arb_token_addr: StorageAddress,

    /// Factory address that's allowed to call this contract to create new
    /// campaigns.
    factory_addr: StorageAddress,

    /// Currently outstanding campaign start timestamps with the trading address.
    /// Infra campaigns run for 3 days, then they begin the period where slashing is
    /// possible.
    campaign_starts: StorageMap<Address, StorageU64>,

    /// Voting power vested globally in the different outcomes cumulative
    /// that's created with a decay function. Used to determine the winner
    /// of this infrastructure campaign.
    campaign_global_power_vested: StorageMap<Address, StorageU256>,

    /// Market description. This should be keccak256(<(url committee|beauty contest)>:<description>). This is used to figure out how this should resolve.
    campaign_desc: StorageMap<Address, StorageB32>,

    /// Market power calculated by the decaying function vested into
    /// these outcomes.
    /// trading => outcome => power
    campaign_vested_power: StorageMap<Address, StorageMap<B8, StorageU256>>,

    /// User vested power that we update for each time they make a
    /// prediction in an outcome. Used to determine the power that a user
    /// has for sweeping them later, or allowing them to sweep others.
    user_vested_power: StorageMap<Address, StorageMap<B8, StorageMap<Address, StorageU256>>>,

    /// Amounts invested by a specific user of Staked ARB into an outcome.
    user_vested_arb StorageMap<Address, StorageMap<Address, StorageU256>>,

    /// The amount of Staked ARB that was vested in this outcome by everyone.
    campaign_vested_arb: StorageMap<Address, StorageU256>,

    /// Was a winner determined?
    campaign_winner: StorageMap<Address, StorageB8>,
}
