
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
| Proxy admin            | 											  |
| Factory implementation | 0xaDF24ea241237b5e425844d6D14bbF5C694D6b55 |
| ERC20 implementation   | 0x4357E36867827d9F7FE6A93c6b6b2f91aD7E3022 |
| Trading mint impl      | 0xD6a38ADD052103E2dB4873a5CfcDb1C20e77Adc5 |
| Trading extras impl    | 0xd8A1F94C5Ba192C47c4f1494b7A112858D4daB55 |
| Factory proxy          | 0x32de2f7Fa9762bDd2f7E8bC1bD120eB9d81AAC6F |
