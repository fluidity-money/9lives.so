
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
| Factory implementation | 0xD88260c40c65c7569E82c529b8da3E98b80Da032 |
| ERC20 implementation   | 0x24A20811eBA6c39e3B1A613e892eBfc6A81Dd6ee |
| Trading mint impl      | 0xA929596a58A35F9ca4E9E98075C63c392195ffBc |
| Trading extras impl    | 0xF60DD9b41A77A33E5F0E881e408cc577BC18245e |
| Factory proxy          | 0x3A238B6b12F5da5ED7BAA7Fbb871fc5455AA2fc0 |
