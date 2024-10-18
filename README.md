
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
| Proxy admin            | 0xa04b3bfc6d4415948787617a74f58fe595536dbb |
| Factory implementation | 0x39c98617e91d955ee5312664ea9bd0e2c5278ce0 |
| ERC20 implementation   | 0x24A20811eBA6c39e3B1A613e892eBfc6A81Dd6ee |
| Trading mint impl      | 0x4f8aff0a7b0011ff09a791e8f233dd89e8698a5b |
| Trading extras impl    | 0xF60DD9b41A77A33E5F0E881e408cc577BC18245e |
| Factory proxy          | 0x3A238B6b12F5da5ED7BAA7Fbb871fc5455AA2fc0 |
| LensesV1               | 0x08cDfFa3efc37Af2d8E9E81FadE6209fD704EbbA |
