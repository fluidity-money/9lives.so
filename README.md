
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
| Proxy admin              |  |
| Factory 1 implementation | 0x1c8d70e411F89AE83B24D456fD2766aF1CaE4b65 |
| Factory 2 implementation | 0xA02E2b4900a9447F6c091349Fc9Ac5E4d47C4EeB |
| ERC20 implementation     | 0xB8996467D7B01AE6e94Fe93CbFF51f9d08207224 |
| Trading mint impl        | 0xf9368BaE0f02e3ba26B0Be6b34c69298652d892a |
| Trading extras impl      | 0xae5B2c57B7BC988A541B0F7c190819696B69c5B2 |
| Factory proxy            |  |
| LensesV1                 | 0xB6ce369f7C4c29a6fe707b8eDe7A1547D63A0A7b |
