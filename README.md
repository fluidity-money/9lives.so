
# 9Lives

9Lives is an Arbitrum Stylus smart contract implemented with a simple factory/pair
pattern. A factory takes a list of outcomes, and creates a variable number of contracts
with a minimal viable proxy pointing to share ERC20s, and a trading contract.

![Diagram of the system](diagram.svg)

## Roadmap

- [ ] UX improvements (shares are more visible, smart account behaviour)
- [ ] Mainnet is supported as well. Mainnet has disclosure that funds are locked up until the election is over.
- [ ] Achievements and portfolio page is supported. Some socialfi elements.
    1. Users can choose their favourite achievements to display in a minified form next to their Meow Domain.
    2. Meow domains is supported in the UI.
- [ ] Collect payoff from the campaign ending in the frontend.
- [ ] Custom fee collection and pool configuration supported (use beauty contest with fixed date, many outcomes if they want)
- [ ] Anyone can create pools. Custom display of pools a la Ebay customisation. Tracking of people investing in specific campaigns and their outcomes for frontpage stack ranking feature.
    1. A fixed fee is sent to creator of when shares are created.
    2. Behind the scenes deferring to the AMM model if more than two outcomes.
    3. Customise the UI of the frontpage for the info
    4. Settlement based on a website URL?
    5. Stack ranking is done for automated updating of frontpage
    6. Campaign report functionality. Images are screened automatically for bad images with A
    7. API to update campaign by the original sender
    8. Anti bad content screening API used
- [ ] Layerzero configuration with Arbitrum One mainnet with UMA
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
| Factory 1 implementation | 0xc3ec0a8f059a02b8991f66e25eb90dc1262caf46 |
| Factory 2 implementation | 0x15bd7286550309636046953c6824b2fcf1dc4d31 |
| Trading mint impl        | 0x34Ac578cce13f7165DA843Fa5d817fc00b3036fe |
| Trading extras impl      | 0xd484d84b440a4c50318C7387Db3F0Ffba8771051 |
| Factory proxy            | 0x6c49d7845d1C9540B3D53B01296248b4B0a9d60D |
| ERC20 implementation     | 0x08444e75F468f0298Fcef1d7e7ED7ecFEf8d6daf |
| LensesV1                 | 0x9a7eBd1a085BaCDD6211Fd77ac26b772b48BD6B4 |

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
