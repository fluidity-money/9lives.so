
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
| Proxy admin                            | 0xFEb6034FC7dF27dF18a3a6baD5Fb94C0D3dCb6d5 |
| Factory 1 implementation               | 0xe7918a07158e5303c50816eee23ddd16cce985e4 |
| Factory 2 implementation               | 0x5653cc20ebe2d4a205ef55edeb58150cb48a7c08 |
| Lockup implementation                  | 0x3a98589ef50a8433966491354b9a182ca1cdc95a |
| Optimistic infra market implementation | 0xfe359f63eee88bb453b8a5957bfb209087057800 |
| Trading DPM mint impl                  | 0x434f0501680b8d30c069e81fa9e119c977b57623 |
| Trading DPM extras impl                | 0x28652521432cb65825d5ce834902e1387e137ad8 |
| Trading DPM price impl                 | 0x1b9f3cc7738e942ddd8973bd0129582107a5ae2f |
| Trading DPM quotes impl                | 0xc5370074c9bcb81086cf50057db76e46d0850932 |
| Trading DPM price impl                 | 0x1b9f3cc7738e942ddd8973bd0129582107a5ae2f |
| Trading AMM mint impl                  | 0xe6b7ff7d1cc6b105b7083096fd8ba6d9f89b30ca |
| Trading AMM extras impl                | 0x831664ed6c1a498822124c94c12461078efbcfdc |
| Trading AMM price impl                 | 0x7816536a927faa40213962874eba85c30203bb71 |
| Trading AMM quotes impl                | 0xd28bc82b6c1fbfa7ed99be2109cf330511af8c6a |
| Trading AMM price impl                 | 0x7816536a927faa40213962874eba85c30203bb71 |
| Share implementation                   | 0xaF962315062b8999807796BF19F126585815e996 |
| Lockup token implementation            | 0x6836cbC634D17F051Ab4f5F966F28B5b85f8CF1F |
| Infrastructure market proxy            | 0x8cb5f36721ee506bfe0e6439c56445739dff3a78 |
| Lockup proxy                           | 0xc68b7395bdd6bbe7943f66055d06f2cd55631a67 |
| Factory proxy                          | 0xa893fe339383ddb745415cdd4124ba51bfbc32fb |
