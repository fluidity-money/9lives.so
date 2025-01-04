
# 9Lives

9Lives is an Arbitrum Stylus smart contract implemented with a simple factory/pair
pattern. A factory takes a list of outcomes, and creates a variable number of contracts
with a minimal viable proxy pointing to share ERC20s, and a trading contract.

Inventors create campaigns (the prediction markets) by locking up "incentive" amounts, and
by picking the type of oracle they want to use. Any fees earned in the campaign are sent
to the Inventor, which provides incentive to create markets. Markets must be created with
a hard deadline and a Beauty Contest or a Infrastructure Market, or with a Contract
Interaction type of outcome. The Inventor must communicate to the Factory which oracle
they would like to use, and provide the hash of the string that must be used to determine
the outcome. This will then set the correct behaviour.

```mermaid
flowchart TD
    Trader --> |Locks up incentive amount, sets parameters| Factory
    Factory --> |Sets start, end, description, if infra market oracle chosen| Infra[Infra market]
    Factory --> |Deploys contract. Sets parameters| Trading
    Factory --> |Configures Longtail pool| Longtail
    Factory --> |Deploys ERC20 assets for each outcome| ERC20s
    Trading --> |Disables Longtail once trading is done| Factory
    ERC20s --> |Burns and mints supply| Trading
    Infra --> |Tells Trading who won| Trading
```

Infra Markets are prediction markets where Staked ARB is locked up as LARB, which is used
to predict the outcome of another prediction market with a commit and reveal scheme. These
markets exist in an optimistic state where anyone can "call" the outcome, before being
challenged with a "whinge", which begins the process of a commit and reveal system.
Following this, amounts can be claimed with a slashing process based on amounts staked.

Oracle State oracles are very simple comparatively, as presumably the associated Trading
contract was configured to allow early activation, so all a caller must do is activate the
associated Oracle State contract. These could communicate with LayerZero to pull
information from another chain, and the contract will simply check the result of the
message. If it's not activated by the date that's given, then it defaults to a "DEFAULT"
clause that could be "no" if a user were to try to estimate the price of something.

---

![Diagram of the system](diagram.svg)

## Roadmap

- [X] UX improvements (shares are more visible, smart account behaviour)
- [X] Mainnet is supported as well. Mainnet has disclosure that funds are locked up until the election is over.
- Achievements and portfolio page is supported. Some socialfi elements.
    1. [ ] Users can choose their favourite achievements to display in a minified form next to their Meow Domain.
    2. [ ] Meow domains is supported in the UI.
- [X] Collect payoff from the campaign ending in the frontend.
- [ ] Custom fee collection and pool configuration supported (use beauty contest with fixed date, many outcomes if they want)
- Anyone can create pools. Custom display of pools a la Ebay customisation.
    1. [X] A fixed fee is sent to creator of when shares are created.
    2. [X] Behind the scenes deferring to the AMM model if more than two outcomes.
    3. [ ] Customise the UI of the frontpage for the info
    4. [ ] Stack ranking is done for automated updating of frontpage
    5. [ ] Campaign report functionality. Images are screened automatically for bad content with CSAM
    6. [ ] API to update campaign by the original sender
    9. [ ] Custom embed when sharing URL
- [ ] Prediction market DAO. Token launch

## Building contracts

	make build

## Updating docs (after editing markdown files)

	forge doc -b

## Testing

Testing must be done with no trading or contract feature enabled. Testing is only possible
on the local environment, or with end to end tests with an Arbitrum node.

	./tests.sh

## Errors

This table is a helpful reference for the types of errors the contracts might produce:

|               Name            | Code |
|-------------------------------|------|
| AlreadyConstructed            | 0x0  |
| MustContainOutcomes           | 0x1  |
| OddsMustBeSet                 | 0x2  |
| U256TooLarge                  | 0x3  |
| TooSmallNumber                | 0x4  |
| TooBigNumber                  | 0x5  |
| NegNumber                     | 0x6  |
| LongtailError                 | 0x7  |
| ShareError                    | 0x8  |
| ERC20ErrorTransfer            | 0x9  |
| TradingError                  | 0xa  |
| ERC20UnableToUnpack           | 0xb  |
| ERC20ReturnedFalse            | 0xc  |
| NotOracle                     | 0xd  |
| DoneVoting                    | 0xe  |
| NotTradingContract            | 0xf  |
| NotWinner                     | 0x10 |
| NegU256                       | 0x11 |
| CheckedPowOverflow            | 0x12 |
| CheckedMulOverflow            | 0x13 |
| CheckedAddOverflow            | 0x14 |
| CheckedSubOverflow            | 0x15 |
| CheckedDivOverflow            | 0x16 |
| TwoOutcomesOnly               | 0x17 |
| Infinity                      | 0x18 |
| NegativeFixedToUintConv       | 0x19 |
| UnusualAmountCreated          | 0x1a |
| SqrtOpNone                    | 0x1b |
| ERC20ErrorTransferFrom        | 0x1c |
| ERC20ErrorPermit              | 0x1d |
| ERC20ErrorBalanceOf           | 0x1e |
| ZeroShares                    | 0x1f |
| CamelotError                  | 0x20 |
| BadSeedAmount                 | 0x21 |
| LockedARBError                | 0x22 |
| LockedARBUnableToUnpack       | 0x23 |
| AlreadyRegistered             | 0x24 |
| NotFactoryContract            | 0x25 |
| NotInfraMarket                | 0x26 |
| InfraMarketHasNotStarted      | 0x27 |
| InfraMarketTooMuchVested      | 0x28 |
| InfraMarketHasExpired         | 0x29 |
| LockupError                   | 0x2a |
| NotInsideSweepingPeriod       | 0x2b |
| IncorrectSweepInvocation      | 0x2c |
| UserAlreadyTargeted           | 0x2d |
| InfraMarketWindowClosed       | 0x2e |
| IsShutdown                    | 0x2f |
| FactoryCallError              | 0x30 |
| FactoryCallUnableToUnpack     | 0x31 |
| CallerIsNotFactory            | 0x32 |
| NotEnabled                    | 0x33 |
| LockupUnableToUnpack          | 0x34 |
| BadVictim                     | 0x35 |
| VictimCannotClaim             | 0x36 |
| NoVestedPower                 | 0x37 |
| ZeroAmount                    | 0x38 |
| InfraMarketCallError          | 0x39 |
| NinelivesLockedArbCreateError | 0x3a |
| NonexistentOutcome            | 0x3b |
| DeployError                   | 0x3c |
| CalledTimeUnset               | 0x3d |
| WhingedTimeUnset              | 0x3e |
| NotInsideCallingPeriod        | 0x3f |
| CampaignAlreadyCalled         | 0x40 |
| PredictingNotStarted          | 0x41 |
| InCallingPeriod               | 0x42 |
| SomeoneWhinged                | 0x43 |
| WinnerAlreadyDeclared         | 0x44 |
| NotInWhingingPeriod           | 0x45 |
| PreferredOutcomeIsZero        | 0x46 |
| AlreadyWhinged                | 0x47 |
| OutcomeDuplicated             | 0x48 |
| NotPastDeadline               | 0x49 |
| ZeroDesc                      | 0x4a |
| ZeroTradingAddr               | 0x4b |
| NotRegistered                 | 0x4c |
| NotOperator                   | 0x4d |
| TradingEmpty                  | 0x4e |
| TradingUnableToUnpack         | 0x4f |
| BeautyContestBadOutcomes      | 0x50 |
| BelowThreeHourBuyin           | 0x51 |
| NoDAOMoney                    | 0x52 |
| ZeroCallDeadline              | 0x53 |
| InconclusiveAnswerToCall      | 0x54 |
| PastCallingDeadline           | 0x55 |
| CannotEscape                  | 0x56 |
| NotAfterWhinging              | 0x57 |
| NotInCommitReveal             | 0x58 |
| CommitNotTheSame              | 0x59 |
| AlreadyRevealed               | 0x5a |
| NotAllowedZeroCommit          | 0x5b |
| ZeroBal                       | 0x5c |
| StakedArbUnusual              | 0x5d |
| TooEarlyToWithdraw            | 0x5e |
| VictimLowBal                  | 0x5f |
| CampaignWinnerSet             | 0x60 |
| OutcomesEmpty                 | 0x61 |
| InvalidEpoch                  | 0x62 |
| PotAlreadyClaimed             | 0x63 |
| CampaignZeroCaller            | 0x64 |
| WinnerUnset                   | 0x65 |
| BadWinner                     | 0x66 |
| CantWhingeCalled              | 0x67 |
| NotReadyToDeclare             | 0x68 |
| AlreadyCommitted              | 0x69 |
| DPMOnly                       | 0x6a |

## Deployments

### Superposition mainnet

|      Deployment name     |              Deployment address            |
|--------------------------|--------------------------------------------|
| Proxy admin              |  |
| Factory 1 implementation |  |
| Factory 2 implementation |  |
| Trading mint impl        |  |
| Trading extras impl      |  |
| Factory proxy            |  |
| ERC20 implementation     |  |
| LensesV1                 |  |

### Superposition testnet

|        Deployment name        |              Deployment address            |
|-------------------------------|--------------------------------------------|
| Proxy admin                   | `0xFEb6034FC7dF27dF18a3a6baD5Fb94C0D3dCb6d5` |
| Factory 1 implementation      | `0x1736213dc056931ac544e114c74408c9aab44b26` |
| Factory 2 implementation      | `0x8487351dd709efac014d5b834edb7678e34574d9` |
| Lockup implementation         | `0x771fa829ba1b445b03dae165d59d418b389fda0d` |
| Infrastructure market proxy   | `0xbdce46aca28a05f969cf675cb2777bae23bd7ff8` |
| Lockup proxy                  | `0x8ab2b21084e2145a5338b3cf7cd45dad2f01222e` |
| Lockup token proxy            | `0x3ca49832937a86c0a99dd897e775ed9b7d6b38db` |
| Factory proxy                 | `0x048db37b4bf07744bca95498e078af490c7b66fd` |
| Helper factory                | `0x2790A6F7aA7679385Af917F06cFF0C0ff484F0d7` |
| LensesV1                      | `0xe5d515eC8ECa5d70518e452b594dD0EFb715cB7d` |
| Beauty contest                | `0x3f8cd5a3a67b57f8370c5699064e642d5924608b` |
| Sarp AI Resolver              | `0x15bebdf285bfe0039fd266af207f6d278aaac7f3` |
