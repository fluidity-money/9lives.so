
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
| Factory implementation | 0x1b86293f065355674eB57b9b246E156De3615Fe3 |
| ERC20 implementation   | 0x314E174CD27C20206079db7455af49fa17e401a0 |
| Trading mint impl      | 0xFF02930eF3774686b587C9641112ce91E93aBF8a |
| Trading extras impl    | 0xa4c0b4bF1331944Ac4dc98C4305F9CC603ce2EaE |
| Factory proxy          | 0x9705a4CD5525B4655eAac9d40cAF03BA7E0268cc |
