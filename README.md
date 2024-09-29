
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
| Proxy admin            | 0x6ca2944c0b4496e22f9cba80bd4c2309b4cb5e00 |
| Factory implementation | 0x0eb9c6a66f1c12935d53efe98f0ae27ef886685a |
| ERC20 implementation   | 0xd7d7e74907A5Ddf704Bb8CA16aa6BAc583560B8f |
| Trading implementation | 0xaf877eb0966702a777af28a6239aabbdf1b272c0 |
| Factory proxy          | 0xcefe59A5809B91C452bd2Ce239140F9914cf82D4 |
