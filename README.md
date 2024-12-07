
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
empty or purely textual (as is the case with a string), or a description of a oracle's
requirement for voting. Losers that bet incorrectly in the Optimistic Infra Market have
their funds slashed. After 3 days, a 2 day period begins where correct bettors can slash
loser Infra Market predictions and receive the funds themselves. After this 2 day window
(5 days has elapsed in total), a "ANYTHING GOES" period begins, where users can slash any
bad bettors prediction without regard for their token position (as long as they bet
correctly).

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
| Factory 1 implementation      | `0x5ac4a47f6a785a2dccf6bda6d2959114f23c0149` |
| Factory 2 implementation      | `0x6f6b153ac2d720dd7bd984f1f6a48aade348f424` |
| Lockup implementation         | `0x017bb05e3385af991f706eb699d9da79096db657` |
| Optimistic infra predict impl | `0xd89288ca3f38625e1fb259e88a35475a26e05424` |
| Optimistic infra sweep impl   | `0xd98216645e6a154bf7220906e7eaf607d37953f8` |
| Optimistic infra extras impl  | `0xca69e42b6b47e5c8c6b70a837a4d19a8558587fc` |
| Trading DPM mint impl         | `0x386dc2d5ce72299e77be41eea7c097e0d6e2e375` |
| Trading DPM extras impl       | `0x876701a2e81e670a1cf9b417fb3600ccb332bfba` |
| Trading DPM price impl        | `0x0ab522d109827aeb5b1280af3b90346de3270981` |
| Trading DPM quotes impl       | `0x443d83bc69af609ef5bf043ada258c9833817e65` |
| Trading DPM price impl        | `0x0ab522d109827aeb5b1280af3b90346de3270981` |
| Trading AMM mint impl         | `0xee0fddf33a81ccb9891b0265e11577144638bb8d` |
| Trading AMM extras impl       | `0xc6f13c5b3ad68d236622f66d0c12c6501c128655` |
| Trading AMM price impl        | `0x199da8fe8efe29a7fa8567a582b2b3c16ce00d74` |
| Trading AMM quotes impl       | `0x8baa4075fb83e8903a326a7ac089475d65ce0c9b` |
| Trading AMM price impl        | `0x199da8fe8efe29a7fa8567a582b2b3c16ce00d74` |
| Share implementation          | `0x886aF2442228578d95086518f1D333391Ad76335` |
| Lockup token implementation   | `0x5c968D92795C12B14856eD1e33657c38D5071217` |
| Infrastructure market proxy   | `0x330656e0f5f3d9eb6315df356176ce0251cf7a31` |
| Lockup proxy                  | `0xb8a339ac7bbd11d68ef420fe1e1ab892a9af4097` |
| Lockup token proxy            | `0x62e3f7aab06454d3159561b9d7397049c2594098` |
| Factory proxy                 | `0xe1fc0068ac7809d2a4635de64b59d18fdd9ce22d` |
| Helper factory                | `0xC0A66BFb62178B9048b3189Cb6f50AE67b5479bB` |
| LensesV1                      | `0x38710FC5EA5984A5eC7867c61910a7364b4620DE` |
