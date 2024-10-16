
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

|    Deployment name     |              Deployment address            |
|------------------------|--------------------------------------------|
| Proxy admin            |  										  |
| Factory implementation | 0xd4c29c4E575a48bAc052cb5B6074f11E57EBA48b |
| ERC20 implementation   | 0x3fC6F680837B8Ea6A3B4113341F098D95af20503 |
| Trading mint impl      | 0x83C75b124C7664CF9506bc1c9Be3Df3dC37Bd0c4 |
| Trading extras impl    | 0x56B1A53bAF9cfdC9b28f2B0D0C9D20defd809448 |
| Factory proxy          | 0x14011904f399a7854FDf03329Bb4A897D336676f |
