
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
- [X] Custom fee collection and pool configuration supported (use beauty contest with fixed date, many outcomes if they want)
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
| AlreadyConstructed            | 0x990900                                                                                                                                                                                       |
| MustContainOutcomes           | 0x990901                                                                                                                                                                                       |
| OddsMustBeSet                 | 0x990902                                                                                                                                                                                       |
| U256TooLarge                  | 0x990903                                                                                                                                                                                       |
| TooSmallNumber                | 0x990904                                                                                                                                                                                       |
| TooBigNumber                  | 0x990905                                                                                                                                                                                       |
| NegNumber                     | 0x990906                                                                                                                                                                                       |
| LongtailError                 | 0x9900                                                                                                                                                                                         |
| ShareError                    | 0x9902                                                                                                                                                                                         |
| ERC20ErrorTransfer            | 0x99010000000000000000000000000000000000000000                                                                                                                                                 |
| TradingError                  | 0x9903                                                                                                                                                                                         |
| ERC20UnableToUnpack           | 0x99090b                                                                                                                                                                                       |
| ERC20ReturnedFalse            | 0x99090c                                                                                                                                                                                       |
| NotOracle                     | 0x99090d                                                                                                                                                                                       |
| DoneVoting                    | 0x99090e                                                                                                                                                                                       |
| NotTradingContract            | 0x99090f                                                                                                                                                                                       |
| NotWinner                     | 0x990910                                                                                                                                                                                       |
| NegU256                       | 0x990911                                                                                                                                                                                       |
| CheckedPowOverflow            | 0x990912                                                                                                                                                                                       |
| CheckedMulOverflow            | 0x990913                                                                                                                                                                                       |
| CheckedAddOverflow            | 0x990914                                                                                                                                                                                       |
| CheckedSubOverflow            | 0x990915                                                                                                                                                                                       |
| CheckedDivOverflow            | 0x990916                                                                                                                                                                                       |
| TwoOutcomesOnly               | 0x990917                                                                                                                                                                                       |
| Infinity                      | 0x990918                                                                                                                                                                                       |
| NegativeFixedToUintConv       | 0x990919                                                                                                                                                                                       |
| UnusualAmountCreated          | 0x99091a                                                                                                                                                                                       |
| SqrtOpNone                    | 0x99091b                                                                                                                                                                                       |
| ERC20ErrorTransferFrom        | 0x99040000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000 |
| ERC20ErrorPermit              | 0x99050000000000000000000000000000000000000000                                                                                                                                                 |
| ERC20ErrorBalanceOf           | 0x99060000000000000000000000000000000000000000                                                                                                                                                 |
| ZeroShares                    | 0x99091f                                                                                                                                                                                       |
| CamelotError                  | 0x990920                                                                                                                                                                                       |
| BadSeedAmount                 | 0x990921                                                                                                                                                                                       |
| LockedARBError                | 0x99070000000000000000000000000000000000000000                                                                                                                                                 |
| LockedARBUnableToUnpack       | 0x990923                                                                                                                                                                                       |
| AlreadyRegistered             | 0x990924                                                                                                                                                                                       |
| NotFactoryContract            | 0x990925                                                                                                                                                                                       |
| NotInfraMarket                | 0x990926                                                                                                                                                                                       |
| InfraMarketHasNotStarted      | 0x990927                                                                                                                                                                                       |
| InfraMarketTooMuchVested      | 0x990928                                                                                                                                                                                       |
| InfraMarketHasExpired         | 0x990929                                                                                                                                                                                       |
| LockupError                   | 0x99100000000000000000000000000000000000000000                                                                                                                                                 |
| NotInsideSweepingPeriod       | 0x99092b                                                                                                                                                                                       |
| IncorrectSweepInvocation      | 0x99092c                                                                                                                                                                                       |
| UserAlreadyTargeted           | 0x99092d                                                                                                                                                                                       |
| InfraMarketWindowClosed       | 0x99092e                                                                                                                                                                                       |
| IsShutdown                    | 0x99092f                                                                                                                                                                                       |
| FactoryCallError              | 0x9907                                                                                                                                                                                         |
| FactoryCallUnableToUnpack     | 0x990931                                                                                                                                                                                       |
| CallerIsNotFactory            | 0x990932                                                                                                                                                                                       |
| NotEnabled                    | 0x990933                                                                                                                                                                                       |
| LockupUnableToUnpack          | 0x990934                                                                                                                                                                                       |
| BadVictim                     | 0x990935                                                                                                                                                                                       |
| VictimCannotClaim             | 0x990936                                                                                                                                                                                       |
| NoVestedPower                 | 0x990937                                                                                                                                                                                       |
| ZeroAmount                    | 0x990938                                                                                                                                                                                       |
| InfraMarketCallError          | 0x9908                                                                                                                                                                                         |
| NinelivesLockedArbCreateError | 0x99093a                                                                                                                                                                                       |
| NonexistentOutcome            | 0x99093b                                                                                                                                                                                       |
| DeployError                   | 0x99093c                                                                                                                                                                                       |
| CalledTimeUnset               | 0x99093d                                                                                                                                                                                       |
| WhingedTimeUnset              | 0x99093e                                                                                                                                                                                       |
| NotInsideCallingPeriod        | 0x99093f                                                                                                                                                                                       |
| CampaignAlreadyCalled         | 0x990940                                                                                                                                                                                       |
| PredictingNotStarted          | 0x990941                                                                                                                                                                                       |
| InCallingPeriod               | 0x990942                                                                                                                                                                                       |
| SomeoneWhinged                | 0x990943                                                                                                                                                                                       |
| WinnerAlreadyDeclared         | 0x990944                                                                                                                                                                                       |
| NotInWhingingPeriod           | 0x990945                                                                                                                                                                                       |
| PreferredOutcomeIsZero        | 0x990946                                                                                                                                                                                       |
| AlreadyWhinged                | 0x990947                                                                                                                                                                                       |
| OutcomeDuplicated             | 0x990948                                                                                                                                                                                       |
| NotPastDeadline               | 0x990949                                                                                                                                                                                       |
| ZeroDesc                      | 0x99094a                                                                                                                                                                                       |
| ZeroTradingAddr               | 0x99094b                                                                                                                                                                                       |
| NotRegistered                 | 0x99094c                                                                                                                                                                                       |
| NotOperator                   | 0x99094d                                                                                                                                                                                       |
| TradingEmpty                  | 0x99094e                                                                                                                                                                                       |
| TradingUnableToUnpack         | 0x99090000000000000000000000000000000000000000                                                                                                                                                 |
| BeautyContestBadOutcomes      | 0x990950                                                                                                                                                                                       |
| BelowThreeHourBuyin           | 0x990951                                                                                                                                                                                       |
| NoDAOMoney                    | 0x990952                                                                                                                                                                                       |
| ZeroCallDeadline              | 0x990953                                                                                                                                                                                       |
| InconclusiveAnswerToCall      | 0x990954                                                                                                                                                                                       |
| PastCallingDeadline           | 0x990955                                                                                                                                                                                       |
| CannotEscape                  | 0x990956                                                                                                                                                                                       |
| NotAfterWhinging              | 0x990957                                                                                                                                                                                       |
| NotInCommitReveal             | 0x99095800000000000000000000000000000000                                                                                                                                                       |
| CommitNotTheSame              | 0x990959                                                                                                                                                                                       |
| AlreadyRevealed               | 0x99095a                                                                                                                                                                                       |
| NotAllowedZeroCommit          | 0x99095b                                                                                                                                                                                       |
| ZeroBal                       | 0x99095c                                                                                                                                                                                       |
| StakedArbUnusual              | 0x99095d                                                                                                                                                                                       |
| TooEarlyToWithdraw            | 0x99095e                                                                                                                                                                                       |
| VictimLowBal                  | 0x99095f                                                                                                                                                                                       |
| CampaignWinnerSet             | 0x990960                                                                                                                                                                                       |
| OutcomesEmpty                 | 0x990961                                                                                                                                                                                       |
| InvalidEpoch                  | 0x990962                                                                                                                                                                                       |
| PotAlreadyClaimed             | 0x990963                                                                                                                                                                                       |
| CampaignZeroCaller            | 0x990964                                                                                                                                                                                       |
| WinnerUnset                   | 0x990965                                                                                                                                                                                       |
| BadWinner                     | 0x990966                                                                                                                                                                                       |
| CantWhingeCalled              | 0x990967                                                                                                                                                                                       |
| NotReadyToDeclare             | 0x990968                                                                                                                                                                                       |
| AlreadyCommitted              | 0x990969                                                                                                                                                                                       |
| DPMOnly                       | 0x99096a                                                                                                                                                                                       |
| BadTradingCtor                | 0x99096b                                                                                                                                                                                       |
| TradingAddrNonExistent        | 0x99096c                                                                                                                                                                                       |
| ERC20Approve                  | 0x99096d                                                                                                                                                                                       |
| TestingUnreachable            | 0x99096e                                                                                                                                                                                       |
| OutcomeIsZero                 | 0x99096f                                                                                                                                                                                       |
| NegativeAmountWhenDPM         | 0x990970                                                                                                                                                                                       |
| AMMOnly                       | 0x990971                                                                                                                                                                                       |
| CheckedNegOverflow            | 0x990972                                                                                                                                                                                       |
| CheckedConvOverflow           | 0x990973                                                                                                                                                                                       |
| ExcessiveFee                  | 0x990974                                                                                                                                                                                       |

## Deployments

### Superposition mainnet

|        Deployment name        |              Deployment address            |
|-------------------------------|--------------------------------------------|
| Proxy admin                   | `0x6221A9c005F6e47EB398fD867784CacfDcFFF4E7` |
| Factory 1 implementation      | `0x3302ac14ad6b38baf789571395cc3a54f0f65e52` |
| Factory 2 implementation      | `0x928b627add9c2a3578b5c178423724f4d20202ed` |
| Lockup implementation         | `0x99596b476d5e16e4a30bd4858dd289a763671294` |
| Optimistic infra predict impl | `0xf94aeb587d332d0e7f2f1e2c87ffea1385ff0505` |
| Trading DPM mint impl         | `0x7b203ff48f76b163bed86b5f2cb66ce6a46d62d4` |
| Trading DPM extras impl       | `0x81eebeda7eb9f68c9a825c619f5e0d13a117e5f6` |
| Trading DPM price impl        | `0x8fc31d39edec596e8089b313920c05642e86d549` |
| Trading DPM quotes impl       | `0x7439ec52bd28c21f59b07a7a12a09c1f7feac7cf` |
| Trading AMM mint impl         | `0x75a1561702de3a5bb5ae07ef0106a085a38b9369` |
| Trading AMM extras impl       | `0xb73ceaf59fe6d13792153ee73ab2474de8c6df10` |
| Trading AMM price impl        | `0xe8e2e4ac62b89a8b0e0632fd9f19316b8b2af76e` |
| Trading AMM quotes impl       | `0x1086fe3c7a453e31d5f04a55924ec633b62157d9` |
| Share implementation          | `0x3e27e934344bf490457231Cb8F0c0eda7d60C362` |
| Lockup token implementation   | `0x70143C674A23a43Ad487D33c4035Ba1D012ac598` |
| Infrastructure market impl    | `0xe96b68775d90f2df1c6ca5554d3e2cc3dca32d90` |
| Infrastructure market proxy   | `0xc4451d8477cd6b92bfa0d3e2662ce0507a8e10b9` |
| Lockup proxy                  | `0x20d2360706086ec9814d15a52ad2d2aec2c43caa` |
| Lockup token proxy            | `0x14c35ba87e8b490761f492382c9249867b82aaf4` |
| Factory proxy                 | `0x7dfe1fa7760131140cfc48b3ea99719203d8f00b` |
| Helper factory                | `0xe5476af9E9299F139d63077dA735d022953Fd404` |
| LensesV1                      | `0xa6f3dEBce04728d7a43224F051F03976c998CF83` |
| Beauty contest implementation | `0x93fe07641576d1ca1ed44070beff5d01877cc7ac` |
| Beauty contest proxy          | `0x15f4A8a0b8cD0343fAe5a7FC736cD9e0D7bE4d5C` |
| Sarp AI Resolver              | `0x9d73847f1edc930d2a2ee801aeadb4c4567f18e1` |
| Helper factory                | `0xE307205f1558aCE077EADb57DD9e1D4cFf4D3CC8` |
| Buy helper2                   | `0x98E5fEe28CB760A9a97391F319536175700D7524` |
| SARP Signaller                | `0xD608CeF1D7C84feaA0E1520C7a6BC4798cFC1455` |

### Superposition testnet

|        Deployment name        |              Deployment address              |
|-------------------------------|----------------------------------------------|
| Proxy admin                   | `0xfeb6034fc7df27df18a3a6bad5fb94c0d3dcb6d5` |
| Factory 1 implementation      | `0x77ae21e1a2d6325a27f6b8d2939942e2ce0c5c86` |
| Factory 2 implementation      | `0xce9ea9b20c0dd86305a83e0cdd22482946448690` |
| Lockup implementation         | `0x2a1d0738de141a6daa95a28b053e4d2b6af624cd` |
| Optimistic infra predict impl | `0x470babb82b487c8d96197308b267d21fd80d6c19` |
| Trading DPM mint impl         | `0x29319f2e790fcb288194a94eade469a30aeb4b3c` |
| Trading DPM extras impl       | `0x551f19ff6950d3855b8a74f6e8ada0b94b19c8d5` |
| Trading DPM quotes impl       | `0x8e9a67827406728da903b0d28c3145a82fab2a9f` |
| Trading DPM price impl        | `0xfd376ff6ae2cb2e7fc3f1f7a8fee8bdc96f78f95` |
| Trading AMM mint impl         | `0x4e9bc1780ebfe9f4724604000014cdbda800a8d8` |
| Trading AMM extras impl       | `0x5ed4d20742b87676826870338b53b173858b052f` |
| Trading AMM quotes impl       | `0x6e7f0dfec74d514ac993fa98a49fe710c4b48882` |
| Trading AMM price impl        | `0x0820dc3f43dac7da453a1118b110563e67525651` |
| Share implementation          | `0x75F6C33f182f30872dca6949Fe59e74Ee095BAC6` |
| Lockup token implementation   | `0x5218d244A4E1a562Bab518E1294f70bb2B7C0743` |
| Infrastructure market proxy   | `0x67732e6159837762ce10c755a3a68663b8cd36dc` |
| Lockup proxy                  | `0x387cd049405e050bc80ffb569a8b00d4ea5b5587` |
| Lockup token proxy            | `0xa042dd0e86c994984285702976b516956a5529c5` |
| Factory proxy                 | `0x9ff9fe9f0fc458d7d9698345fb9f82c14222e264` |
| Helper factory                | `0x84c5607E2DC13d3677ce18EB52D865aE68497b9E` |
| LensesV1                      | `0xd05a6b7Bc4Df288A20d96C3B948146eeD3748286` |
| Beauty contest implementation | `0xb26f7f9763023437b89b0ee55d3d115964983dc0` |
| Beauty contest proxy          | `0x859871b584706006be6a29e6df5cf5433cc7b905` |
| Sarp AI Resolver              | `0x0000000000000000000000000000000000000000` |
| Buy helper2                   | `0xdE3B2c155c63bE28E5645669bF566ffae5D2b428` |
| SARP Signaller                | `0x2137B4C506f0d7eF2A562B02Be9110a4a3A93bC9` |
