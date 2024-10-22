
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
| Factory 1 implementation | 0xcaA044b9446e77A5F927A2A6Bb2e18752D163644 |
| Factory 2 implementation | 0xaEBc4416263bd0fA6C3B74374fc477ecfF57EE22 |
| ERC20 implementation     | 0x66dE7afbAF6CD247820a19F92144D195D588b051 |
| Trading mint impl        | 0xF948Aba6213c4DAEfA2910Eab3D1920089488c52 |
| Trading extras impl      | 0x875b70ABE28b7aB37EcA7F3cE5Df7313c768eeF0 |
| Factory proxy            | 0xf78950cBC188D39F53111D9a929b817996718698 |
| LensesV1                 | 0xd535A7e7F77111a74686FEc3cecFbab502EC68d3 |
