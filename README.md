
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

Infrastructure Markets are betting situations where Staked ARB is locked up as LARB, which
is used to predict the outcome of a situation. A voting ERC20 from OpenZeppellin is used
as the wrapped asset. Lockup does the conversion. The outcome voting power is a linear
curve that decays until the end of the voting period. Infrastructure Markets are markets
that are created which resolve at a period of 3 days. These markets are designed to be
risk free positions that infrastructure providers can take to "call" an outcome based on
the results of a text field. These text fields can be empty or purely textual (as is the
case with a string), or textual and pointing to a URL (as is the case with URL
committees). Losers that bet incorrectly in the Infrastructure Market have their funds
slashed.

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

### Arbitrum One (pre-US election) - Camelot edition

|      Deployment name     |              Deployment address            |
|--------------------------|--------------------------------------------|
| Proxy admin              | 0xde1a8eda6fc9913224b1e8ad6cdcd8dc1d5080ae |
| Factory 1 implementation | 0xE8594243278f726bd3c5F0D78f56a78F29046C1D |
| Factory 2 implementation | 0x33aC7f5dc2e76867Ae076cE1555bC192469fb827 |
| Trading mint impl        | 0x7650E34114978248AA1f70198241D4E7957C4f57 |
| Trading extras impl      | 0xeC1563C1E29eB933dB9Df1a0D224C134A6be79E1 |
| Factory proxy            | 0x6c49d7845d1C9540B3D53B01296248b4B0a9d60D |
| ERC20 implementation     | 0x1Bb666386b75335c6bAc834a754BE56e880dAa12 |
| LensesV1                 | 0x30Cc3AbEcf76fd53dDf3103395B1Fc6eDA1d1599 |

### Superposition testnet

|      Deployment name     |              Deployment address            |
|--------------------------|--------------------------------------------|
| Proxy admin              | 0x0256a089553ae26fd45fc36495d7cf3a044d0fdb |
| Factory 1 implementation | 0xF1b485d0a0D79FCEAd35E9923E3A07deD14D9A1A |
| Factory 2 implementation | 0xE30f69f9F2A439db7A5fA89707403a4A231368F5 |
| Trading mint impl        | 0xeCAC5280Ad9bF4E2a1AC7a16b884945E134A2c36 |
| Trading extras impl      | 0x3C4bD874746C0EbD3e438900B226Dde963a1eB0c |
| Factory proxy            | 0x22E844526b3921BE5c42f8208a4FEfC5db8d82CB |
| ERC20 implementation     | 0xd27d3c46A66b6F496a67C9cb881f9dF13091A777 |
| LensesV1                 | 0xfCd4E63563D561D979D280B52eD4AB7e7678F204 |
