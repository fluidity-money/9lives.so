
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
| Proxy admin              | 0x418a477056565b930b93644269b58874b31be37f |
| Factory 1 implementation | 0x5A273408a52ad1e07512d84c1a42B6633ed3A8d4 |
| Factory 2 implementation | 0x1c83878D127eD03e7e4181B9B23b0643D96e9C05 |
| ERC20 implementation     | 0xf97f27833472AC1C4BcC8677F9e51e4A611e5b35 |
| Trading mint impl        | 0xF51A3fB9a5aa2a31aB6Fbe1327cA4EE519454b9F |
| Trading extras impl      | 0xc4BEC3aa46893061c01b7724cCe7dBbbD7349B3d |
| Factory proxy            | 0xfcBD5F895797C9B91B1b126812601a57eFAbEb0B |
| LensesV1                 | 0xaFcaD4D9AdE7035401C9B5974ffDE192595cb98b |
