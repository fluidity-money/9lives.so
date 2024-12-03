
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
| Factory 1 implementation               | `0xdc01be6f81ebd489e2f506a09f8967969e15b83a` |
| Factory 2 implementation               | `0x1190599d5ce1b5e95af38997c956fef211c1619a` |
| Lockup implementation                  | `0xfb854048b876416b4c7509e1c84d2a20f987c38a` |
| Optimistic infra market implementation | `0x5df536a5d35c4ec838f8eda1c0c88fabb2980650` |
| Trading DPM mint impl                  | `0x88991790cc61ff90a81ce887c056b81ffe70fbc7` |
| Trading DPM extras impl                | `0xaa19bb66fa15874927d09afd1ef1d8275a9d61f0` |
| Trading DPM price impl                 | `0xf01db50df29571670782fe13336916db1650d150` |
| Trading DPM quotes impl                | `0xf51c45a14d8ca6c504a09124332183166666d549` |
| Trading DPM price impl                 | `0xf01db50df29571670782fe13336916db1650d150` |
| Trading AMM mint impl                  | `0xebc19f0aff71a0d710d4c98fd96b830ff016ff43` |
| Trading AMM extras impl                | `0x6559533c1032344b129fd53326b5b29e1d11a479` |
| Trading AMM price impl                 | `0x73a2b39d186f582b1e1adaf34756392b150ef276` |
| Trading AMM quotes impl                | `0xcf43dc9efa74e5616ab43ef6d93ca3dd69ac763f` |
| Trading AMM price impl                 | `0x73a2b39d186f582b1e1adaf34756392b150ef276` |
| Share implementation                   | `0xAC38FEA0D6eac1fbB2211F3729C447465836BD72` |
| Lockup token implementation            | `0x0d9978Ba5a497699470Da42A09A5759aC4808598` |
| Infrastructure market proxy            | `0xecd4baeb99501114d9426c21aed9982ee4c96042` |
| Lockup proxy                           | `0x99679399ac062644a0bec4b3d4ef3973bee264c3` |
| Lockup token proxy                     | `0xfbb18d325c935cbf4325dbb62b4258e6604bf887` |
| Factory proxy                          | `0x2e56a38de9c07df064704a14b479435f67b2a625` |
| Helper factory                         | `0xD331DA34d68BD6Ef0eF92B7535cf162f69E30c7e` |
| LensesV1                               | `0x6B8ceA22DA83B4de5CF14B324ebf0F065015a84B` |
