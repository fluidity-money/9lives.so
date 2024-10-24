
# 9Lives

9Lives is an Arbitrum Stylus smart contract implemented with a simple factory/pair
pattern. A factory takes a list of outcomes, and creates a variable number of contracts
with a minimal viable proxy pointing to share ERC20s, and a trading contract.

It allows a protocol-sanctioned address to determine which outcome came to reality,
then share holders can convert their positions to fUSDC on request.

![Diagram of the system](diagram.svg)

## Building contracts

	make build

## Updating docs (after editing markdown files)

	forge doc -b

## Testing

Testing must be done with no trading or contract feature enabled. Testing is only possible
on the local environment, or with end to end tests with an Arbitrum node.

	./tests.sh

## Deployments

### Superposition testnet

|      Deployment name     |              Deployment address            |
|--------------------------|--------------------------------------------|
| Proxy admin              | 0x0256a089553ae26fd45fc36495d7cf3a044d0fdb |
| Factory 1 implementation | 0xF1b485d0a0D79FCEAd35E9923E3A07deD14D9A1A |
| Factory 2 implementation | 0xE30f69f9F2A439db7A5fA89707403a4A231368F5 |
| ERC20 implementation     | 0xd27d3c46A66b6F496a67C9cb881f9dF13091A777 |
| Trading mint impl        | 0xeCAC5280Ad9bF4E2a1AC7a16b884945E134A2c36 |
| Trading extras impl      | 0x3C4bD874746C0EbD3e438900B226Dde963a1eB0c |
| Factory proxy            | 0x22E844526b3921BE5c42f8208a4FEfC5db8d82CB |
| LensesV1                 | 0xfCd4E63563D561D979D280B52eD4AB7e7678F204 |
