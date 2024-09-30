
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
| Proxy admin            | 0x85d9f575c2085357b54a385838ee9d4a49f6c93a |
| Factory implementation | 0xc33b79184af71f454c18584b4f9d7b113790e5db |
| ERC20 implementation   | 0x526Ce74aC8c69F379CC27212A4fb35ad211502fB |
| Trading implementation | 0xf7b24649ab2bb4905a2da2940afc49b80156f4bc |
| Factory proxy          | 0x8D3cD4D05DCeb276c6f33AAdC45141BFCB58BAC8 |
