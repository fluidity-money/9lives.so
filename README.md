
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
| Proxy admin            |  |
| Factory implementation | 0xe2807e849d744A9Ef922f54dDCdE3f4020F7D6e7 |
| ERC20 implementation   | 0xE512992B955B417853B98B70FC421C606EC402Bd |
| Trading mint impl      | 0xDA39828b2B7335C2A42F69b2C8aDaceecC20c447 |
| Trading extras impl    | 0xC8bF3B80eDaC8bE1D5C08134680B746aDd74e6b2 |
| Factory proxy          | 0xd6f788544a1F2046183716A99E81Ec93685903f5 |
