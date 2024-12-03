
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

Optimistic Infra Markets are betting situations where Staked ARB is locked up as LARB,
which is used to predict the outcome of a situation. They exist in an "optimistic" state
where anyone can claim which outcome took place for 2 days, then for a grace period of two
days, anyone can "whinge" about the outcome, supplying collateral that is slashed if they
are incorrect. This begins a stage of betting on the outcome. A voting ERC20 from
OpenZeppellin is used as the wrapped asset. Lockup does the conversion. The outcome voting
power is a linear curve that decays until the end of the voting period. Optimistic Infra
Markets in progress are markets that are created which resolve after a period of 3 days.
These markets are designed to be risk free positions that infrastructure providers can
take to "call" an outcome based on the results of a text field. These text fields can be
empty or purely textual (as is the case with a string), or textual and pointing to a URL
(as is the case with URL committees). Losers that bet incorrectly in the Optimistic Infra
Market have their funds slashed. After 3 days, a 2 day period begins where correct bettors
can slash loser Infra Market predictions and receive the funds themselves. After this 2
day window (5 days has elapsed in total), a "ANYTHING GOES" period begins, where users can
slash any bad bettors prediction without regard for their token position (as long as they
bet correctly).

```mermaid
flowchart TD
    Caller --> |Designates who the winning outcome is| Infra[Infra market]
    Infra --> Challenge{Challenge period pass?}
    Challenge --> |No| Disputed[Disputed by whinger]
    Disputed --> Predicting
    Predictor --> |Votes on outcome| Predicting
    Predicting --> |3 day window passes| Sweeping
    Sweeping --> |Collects funds from loser bettors| Lockup
    Lockup --> |Sends money to correct infra market predictors| Predictors
    Sweeping --> |"Decides" the outcome| Trading
    Challenge --> |Yes| Trading
    Trading --> Correct{Did caller correctly designate outcome?}
    Correct --> |Yes| CallerYes[Caller gets fees]
    Correct --> |No | CallerNo[Caller gets no fees]
```

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
- [X] Achievements and portfolio page is supported. Some socialfi elements.
    1. Users can choose their favourite achievements to display in a minified form next to their Meow Domain.
    2. Meow domains is supported in the UI.
- [X] Collect payoff from the campaign ending in the frontend.
- [ ] Custom fee collection and pool configuration supported (use beauty contest with fixed date, many outcomes if they want)
- [ ] Anyone can create pools. Custom display of pools a la Ebay customisation.
    1. A fixed fee is sent to creator of when shares are created.
    2. Behind the scenes deferring to the AMM model if more than two outcomes.
    3. Customise the UI of the frontpage for the info
    4. Settlement based on a website URL
    5. Stack ranking is done for automated updating of frontpage
    6. Campaign report functionality. Images are screened automatically for bad images with A
    7. API to update campaign by the original sender
    8. Anti bad content screening API used
    9. Custom embed when sharing URL
- [ ] Prediction market DAO. Token launch

## Building contracts

	make build

## Updating docs (after editing markdown files)

	forge doc -b

## Testing

Testing must be done with no trading or contract feature enabled. Testing is only possible
on the local environment, or with end to end tests with an Arbitrum node.

	./tests.sh

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

|            Deployment name             |              Deployment address            |
|----------------------------------------|--------------------------------------------|
| Proxy admin                            | `0xFEb6034FC7dF27dF18a3a6baD5Fb94C0D3dCb6d5` |
| Factory 1 implementation               | `0x97248df561bda4ee6746731d6975592faec15ec7` |
| Factory 2 implementation               | `0xe38a1a9adfce2f19c6da945cc41ec1c3c0038413` |
| Lockup implementation                  | `0x667b248fc9948cfca7733536cf9c0d5b72cc9ff0` |
| Optimistic infra market implementation | `0xb4af0e3daba51c2d1940779b041ef07f60d9411f` |
| Trading DPM mint impl                  | `0x9e8c6530edb8be2eafd5792ae53b02798d13b19a` |
| Trading DPM extras impl                | `0x79292e255e478397c64143dd042feb78937b255a` |
| Trading DPM price impl                 | `0x1f15d2ceea2a6e901313aaf3c0784f8643883765` |
| Trading DPM quotes impl                | `0x3565a03c8e813e416bc4015a12e5abcbd760ab01` |
| Trading DPM price impl                 | `0x1f15d2ceea2a6e901313aaf3c0784f8643883765` |
| Trading AMM mint impl                  | `0xa9a3b0089131333cdb039e7ebe1f4fd5fd6fa383` |
| Trading AMM extras impl                | `0x2c67479b09d922f7ba79a8fe75f15e4a60f30f5c` |
| Trading AMM price impl                 | `0xe82dacbdc16122adca7bc83d89087c8ff6dcdb7a` |
| Trading AMM quotes impl                | `0x81dee9d9bab9224b327281bb10680e5688cd53ad` |
| Trading AMM price impl                 | `0xe82dacbdc16122adca7bc83d89087c8ff6dcdb7a` |
| Share implementation                   | `0x7f53B18Aba1873bdb0C0f205126fC452106187CB` |
| Lockup token implementation            | `0xe71F986281A8Af932D08866D98c55228A81eB6c0` |
| Infrastructure market proxy            | `0xfed7cd757103689cf92ab871608467b3ddd0d871` |
| Lockup proxy                           | `0x909a817ab7c6eae0f4fc9811d027ab018e1d1026` |
| Lockup token proxy                     | `0xdd705850e2045558a55cf751e73a20b42b176865` |
| Factory proxy                          | `0x952f404867bb7539545efd8a9438d7d4fc5259d5` |
