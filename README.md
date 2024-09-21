
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
| Proxy admin            | 0x3c09d0c7f5448d08c5c386289c628305a54cc6df |
| Factory implementation | 0xa73684fa6fd8fafcab161d283c7cd64e71ff1944 |
| ERC20 implementation   | 0xbcc8578d4DB503386Bcc0A07be3FdE270f4bcE7F |
| Trading implementation | 0xb465a90D16d2EC36410ec68Ae7Dc0d7D2a821728 |
| Factory proxy          | 0x284bD1291E472f2178808145Feb741D3718CA2C9 |
