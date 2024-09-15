
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
| Proxy admin            | 0x4732Cf95be0d23236e999735a1BFca7988e66b23 |
| Factory implementation | 0x01F4b247C60B07DFdE183c9F4A25A79db98801A3 |
| ERC20 implementation   | 0x08062090a803db0E7B6efCE803ac31aD58404572 |
| Trading implementation | 0xdb3751aB36F45D749FF4491D8625d4020D11311b |
| Factory proxy          | 0x71Fa6eBC8073705aaF2611AeD6886044Acb43b87 |
