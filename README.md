
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
| Proxy admin              | 0x524c7243879d72e6182c7e3efcd2b164f3651306 |
| Factory 1 implementation | 0xfe1290854d09e22e8af999af48c4b918806f3068 |
| Factory 2 implementation | 0x63cde81616d46d35fb44480a606be287f34df91f |
| ERC20 implementation     | 0x00831eD728ECAF702C92acAA01710B865cB784b1 |
| Trading mint impl        | 0x40C95243e895D8d374b8a10E79Ef7C166F1b8C91 |
| Trading extras impl      | 0x1d112ad67b53990252da40c7858c3bface9a51ff |
| Factory proxy            | 0x582c92BcA6aDceAc72D8f78CFC158D90f7eF11f7 |
| LensesV1                 | 0x05B234d5562990b2b578013BAFc52b9772b6d8E9 |
