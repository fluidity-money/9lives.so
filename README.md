
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
| Proxy admin            | 0x83dfbdddc9012e4e76d2d0cc97c50d981f4aef38 |
| Factory implementation | 0x086baa305f1eb148e6324f0f17820703e9a0cf83 |
| ERC20 implementation   | 0x16E778C0611497A6739E926b35738Bb93eddEc17 |
| Trading implementation | 0x934b4f2c3a08b864a174800d5349e676d2228fa4 |
| Factory proxy          | 0xa088E2BC674E98Ac3F2b251cA4fECE66BDecB50B |
