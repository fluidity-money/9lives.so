
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

Interrogation of the deployment in the end to end testing library could be done using the
`build.rs` use of `environment.lst`, which could be in turn read with a fresh deploy (and
a clean artifacts directory):

	sort $(find target -name environment.lst) | uniq

You could clear the recorded environment variables the same way with a test harness:

	rm $(find target -name environment.lst)

You could use this to test the code by making a debug build, which includes more
information about reverts, then simulate your calldata against it using
`stylus-interpreter`, making debugging a breeze.

## Errors

This table is a helpful reference for the types of errors the contracts might produce. To
generate these, run `./print-error-table.sh`.

| Error name                    | Error hex                                                                                                                                                                                      |
|-------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| AlreadyConstructed            | 0x999000                                                                                                                                                                                       |
| MustContainOutcomes           | 0x999001                                                                                                                                                                                       |
| OddsMustBeSet                 | 0x999002                                                                                                                                                                                       |
| U256TooLarge                  | 0x999003                                                                                                                                                                                       |
| TooSmallNumber                | 0x999004                                                                                                                                                                                       |
| TooBigNumber                  | 0x999005                                                                                                                                                                                       |
| NegNumber                     | 0x999006                                                                                                                                                                                       |
| LongtailError                 | 0x9900                                                                                                                                                                                         |
| ShareError                    | 0x9902                                                                                                                                                                                         |
| ERC20ErrorTransfer            | 0x99010000000000000000000000000000000000000000                                                                                                                                                 |
| TradingError                  | 0x9903                                                                                                                                                                                         |
| ERC20UnableToUnpack           | 0x99900b                                                                                                                                                                                       |
| ERC20ReturnedFalse            | 0x99900c                                                                                                                                                                                       |
| NotOracle                     | 0x99900d                                                                                                                                                                                       |
| DoneVoting                    | 0x99900e                                                                                                                                                                                       |
| NotTradingContract            | 0x99900f                                                                                                                                                                                       |
| NotWinner                     | 0x999010                                                                                                                                                                                       |
| NegU256                       | 0x999011                                                                                                                                                                                       |
| CheckedPowOverflow            | 0x999012                                                                                                                                                                                       |
| CheckedMulOverflow            | 0x999013                                                                                                                                                                                       |
| CheckedAddOverflow            | 0x999014                                                                                                                                                                                       |
| CheckedSubOverflow            | 0x999015                                                                                                                                                                                       |
| CheckedDivOverflow            | 0x999016                                                                                                                                                                                       |
| TwoOutcomesOnly               | 0x999017                                                                                                                                                                                       |
| Infinity                      | 0x999018                                                                                                                                                                                       |
| NegativeFixedToUintConv       | 0x999019                                                                                                                                                                                       |
| UnusualAmountCreated          | 0x99901a                                                                                                                                                                                       |
| SqrtOpNone                    | 0x99901b                                                                                                                                                                                       |
| ERC20ErrorTransferFrom        | 0x99040000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000 |
| ERC20ErrorPermit              | 0x99050000000000000000000000000000000000000000                                                                                                                                                 |
| ERC20ErrorBalanceOf           | 0x99060000000000000000000000000000000000000000                                                                                                                                                 |
| ZeroShares                    | 0x99901f                                                                                                                                                                                       |
| CamelotError                  | 0x999020                                                                                                                                                                                       |
| BadSeedAmount                 | 0x999021                                                                                                                                                                                       |
| LockedARBError                | 0x99070000000000000000000000000000000000000000                                                                                                                                                 |
| LockedARBUnableToUnpack       | 0x999023                                                                                                                                                                                       |
| AlreadyRegistered             | 0x999024                                                                                                                                                                                       |
| NotFactoryContract            | 0x999025                                                                                                                                                                                       |
| NotInfraMarket                | 0x999026                                                                                                                                                                                       |
| InfraMarketHasNotStarted      | 0x999027                                                                                                                                                                                       |
| InfraMarketTooMuchVested      | 0x999028                                                                                                                                                                                       |
| InfraMarketHasExpired         | 0x999029                                                                                                                                                                                       |
| LockupError                   | 0x99902a                                                                                                                                                                                       |
| NotInsideSweepingPeriod       | 0x99902b                                                                                                                                                                                       |
| IncorrectSweepInvocation      | 0x99902c                                                                                                                                                                                       |
| UserAlreadyTargeted           | 0x99902d                                                                                                                                                                                       |
| InfraMarketWindowClosed       | 0x99902e                                                                                                                                                                                       |
| IsShutdown                    | 0x99902f                                                                                                                                                                                       |
| FactoryCallError              | 0x9907                                                                                                                                                                                         |
| FactoryCallUnableToUnpack     | 0x999031                                                                                                                                                                                       |
| CallerIsNotFactory            | 0x999032                                                                                                                                                                                       |
| NotEnabled                    | 0x999033                                                                                                                                                                                       |
| LockupUnableToUnpack          | 0x999034                                                                                                                                                                                       |
| BadVictim                     | 0x999035                                                                                                                                                                                       |
| VictimCannotClaim             | 0x999036                                                                                                                                                                                       |
| NoVestedPower                 | 0x999037                                                                                                                                                                                       |
| ZeroAmount                    | 0x999038                                                                                                                                                                                       |
| InfraMarketCallError          | 0x9908                                                                                                                                                                                         |
| NinelivesLockedArbCreateError | 0x99903a                                                                                                                                                                                       |
| NonexistentOutcome            | 0x99903b                                                                                                                                                                                       |
| DeployError                   | 0x99903c                                                                                                                                                                                       |
| CalledTimeUnset               | 0x99903d                                                                                                                                                                                       |
| WhingedTimeUnset              | 0x99903e                                                                                                                                                                                       |
| NotInsideCallingPeriod        | 0x99903f                                                                                                                                                                                       |
| CampaignAlreadyCalled         | 0x999040                                                                                                                                                                                       |
| PredictingNotStarted          | 0x999041                                                                                                                                                                                       |
| InCallingPeriod               | 0x999042                                                                                                                                                                                       |
| SomeoneWhinged                | 0x999043                                                                                                                                                                                       |
| WinnerAlreadyDeclared         | 0x999044                                                                                                                                                                                       |
| NotInWhingingPeriod           | 0x999045                                                                                                                                                                                       |
| PreferredOutcomeIsZero        | 0x999046                                                                                                                                                                                       |
| AlreadyWhinged                | 0x999047                                                                                                                                                                                       |
| OutcomeDuplicated             | 0x999048                                                                                                                                                                                       |
| NotPastDeadline               | 0x999049                                                                                                                                                                                       |
| ZeroDesc                      | 0x99904a                                                                                                                                                                                       |
| ZeroTradingAddr               | 0x99904b                                                                                                                                                                                       |
| NotRegistered                 | 0x99904c                                                                                                                                                                                       |
| NotOperator                   | 0x99904d                                                                                                                                                                                       |
| TradingEmpty                  | 0x99904e                                                                                                                                                                                       |
| TradingUnableToUnpack         | 0x99904f                                                                                                                                                                                       |
| BeautyContestBadOutcomes      | 0x999050                                                                                                                                                                                       |
| BelowThreeHourBuyin           | 0x999051                                                                                                                                                                                       |
| NoDAOMoney                    | 0x999052                                                                                                                                                                                       |
| ZeroCallDeadline              | 0x999053                                                                                                                                                                                       |
| InconclusiveAnswerToCall      | 0x999054                                                                                                                                                                                       |
| PastCallingDeadline           | 0x999055                                                                                                                                                                                       |
| CannotEscape                  | 0x999056                                                                                                                                                                                       |
| NotAfterWhinging              | 0x999057                                                                                                                                                                                       |
| NotInCommitReveal             | 0x999058                                                                                                                                                                                       |
| CommitNotTheSame              | 0x999059                                                                                                                                                                                       |
| AlreadyRevealed               | 0x99905a                                                                                                                                                                                       |
| NotAllowedZeroCommit          | 0x99905b                                                                                                                                                                                       |
| ZeroBal                       | 0x99905c                                                                                                                                                                                       |
| StakedArbUnusual              | 0x99905d                                                                                                                                                                                       |
| TooEarlyToWithdraw            | 0x99905e                                                                                                                                                                                       |
| VictimLowBal                  | 0x99905f                                                                                                                                                                                       |
| CampaignWinnerSet             | 0x999060                                                                                                                                                                                       |
| OutcomesEmpty                 | 0x999061                                                                                                                                                                                       |
| InvalidEpoch                  | 0x999062                                                                                                                                                                                       |
| PotAlreadyClaimed             | 0x999063                                                                                                                                                                                       |
| CampaignZeroCaller            | 0x999064                                                                                                                                                                                       |
| WinnerUnset                   | 0x999065                                                                                                                                                                                       |
| BadWinner                     | 0x999066                                                                                                                                                                                       |
| CantWhingeCalled              | 0x999067                                                                                                                                                                                       |
| NotReadyToDeclare             | 0x999068                                                                                                                                                                                       |
| AlreadyCommitted              | 0x999069                                                                                                                                                                                       |
| DPMOnly                       | 0x99906a                                                                                                                                                                                       |
## Deployments

### Superposition mainnet

|        Deployment name        |              Deployment address            |
|-------------------------------|--------------------------------------------|
| Proxy admin                   | `0x6221A9c005F6e47EB398fD867784CacfDcFFF4E7` |
| Factory 1 implementation      | `0x8cea04ab0085173201f2220e097f3d4fe373096c` |
| Factory 2 implementation      | `0x379fe7e831a57a3ec712cb5335eb5ec5617de1ad` |
| Lockup implementation         | `0xd827109ef4dad532861c5eaa9dcc0b084cb0159f` |
| Optimistic infra predict impl | `0xccfb040e4024dcb9f40ca76bab3ea70b34a4a16d` |
| Trading DPM mint impl         | `0xef3d61db18b288bb8262fa2ac874260fb0c520e6` |
| Trading DPM extras impl       | `0x6592d0ee412129f1e75fe74933107cbff3c29cbb` |
| Trading DPM price impl        | `0x0aa841e923214f7105a643519e80fd7c5fa50073` |
| Trading DPM quotes impl       | `0xff6db85681418cacd5bc452f54eba8edc314950f` |
| Trading DPM price impl        | `0x0aa841e923214f7105a643519e80fd7c5fa50073` |
| Trading AMM mint impl         | `0x9eaba6d49f39c8e88f31bdccec5c81bf69ceb567` |
| Trading AMM extras impl       | `0xe58323c9c556bad7cc6767620c3f82300e80da02` |
| Trading AMM price impl        | `0xa53703a0dd532cf491941f3e3b6469c9db756811` |
| Trading AMM quotes impl       | `0x4ca056f2bd802d5d10d318e0d0cf183e557bf6fd` |
| Trading AMM price impl        | `0xa53703a0dd532cf491941f3e3b6469c9db756811` |
| Share implementation          | `0x1278da41113d1a5b6204Fd4D9A48AB04AB3CFd8E` |
| Lockup token implementation   | `0x27FACc2cAE37929b5c62278E7F6D94aE4f1a3A14` |
| Infrastructure market proxy   | `0x6b38fb48cdae954f369105924ba9fa6b9b68777c` |
| Lockup proxy                  | `0x4fe0de5a7ecb431753037bf7213772267098145a` |
| Lockup token proxy            | `0x4308e787b00aa13d41d7ee48158de0ca18c539fd` |
| Factory proxy                 | `0x68e15214616be129d82e5a23d0c9f4d998711c6b` |
| Helper factory                | `0x34472166903043cCD16044055325B9Dd750Dc601` |
| LensesV1                      | `0x96e686b7c21f3fE6ADe182C25d8D98898A1924c6` |
| Beauty contest                | `0x1d15b0bf21c47c56203ba10ec450bb24e5bd562f` |
| Sarp AI Resolver              | `0x9d73847f1edc930d2a2ee801aeadb4c4567f18e1` |

### Superposition testnet

|        Deployment name        |              Deployment address            |
|-------------------------------|--------------------------------------------|
| Proxy admin                   | `0xFEb6034FC7dF27dF18a3a6baD5Fb94C0D3dCb6d5` |
| Factory 1 implementation      | `0xe1841050df5ae8aa09b0980383a62723d70597ad` |
| Factory 2 implementation      | `0x675ac9df1d2f9dc45c69d4928bc0b39913fe6114` |
| Lockup implementation         | `0x061aec2e656167a021861e326f009ebe55b30b9d` |
| Optimistic infra predict impl | `0x2359935aedbc39e124f0e429da2f55015c2293c7` |
| Trading DPM mint impl         | `0xf42848787e102d4ab5cf35118b391c15219b2115` |
| Trading DPM extras impl       | `0xbe2c0d864fa9c496203c9474748dbe302a649643` |
| Trading DPM price impl        | `0xa25593e653e0ea5b8ac98d1f0ed483a4982cb0e2` |
| Trading DPM quotes impl       | `0xa36636d7d2cb4e46a1cdf68f2a370eb642382414` |
| Trading DPM price impl        | `0xa25593e653e0ea5b8ac98d1f0ed483a4982cb0e2` |
| Trading AMM mint impl         | `0xd9431c10b09405bbda393ada4ef9d1c9df0bdcb2` |
| Trading AMM extras impl       | `0xa93b637dfb596c7c5510bb0dfc9a6872381d8f3f` |
| Trading AMM price impl        | `0x2a49c8aa07f47b4dca0f1df7f13921e0cade7213` |
| Trading AMM quotes impl       | `0x71ffffe4f95510f59221bc40b4ab6d94cc2969ed` |
| Trading AMM price impl        | `0x2a49c8aa07f47b4dca0f1df7f13921e0cade7213` |
| Share implementation          | `0x901570280d72dC42d5DAFF2461Da21211b5a35a1` |
| Lockup token implementation   | `0x9FC5266a46951c4543a7748ae4A71aBd33b770D1` |
| Infrastructure market proxy   | `0xab80e599786fcaddeaa9e68e4e148227bc1c8e8d` |
| Lockup proxy                  | `0x48bbfbd4438f245a7e3e793bff794c2e92537034` |
| Lockup token proxy            | `0x39f9e59d1419887c8358f4e00c1bc32eaa5ec811` |
| Factory proxy                 | `0x2d8d202c11ab72bcd98cca155510c2c350385057` |
| Helper factory                | `0x31EC9E431664ff8006fE7f7bD36F749121612e04` |
| LensesV1                      | `0xDFcfDdbb70C950D4539c60D191E719Cf3B20385E` |
| Beauty contest                | `0xca018c29994c2bd8ff9b5ff80a7010c5a0c0bf51` |
| Sarp AI Resolver              | `0x15bebdf285bfe0039fd266af207f6d278aaac7f3` |
| Helper buy                    | `0x2Aa6ddAF979A8B2cE1853e2AE23C1Db2a2A33939` |
