
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

	./tests.sh

## Deployments

### Superposition testnet

|    Deployment name     |              Deployment address            |
|------------------------|--------------------------------------------|
| Factory implementation | 0xaCd31CEAb56214782E735907C26e878aD74c6b7B |
| ERC20 implementation   | 0x1F9cAAB70a527B2cFFB10315b687CBa11Aca8941 |
| Trading implementation | 0x06a6F0d504F425305876520AAaa8b4d1A5086d5b |
| Factory proxy          | 0xC129eB2C77940AC5D118d14f5e640132658F1De2 |
| Proxy admin            | 0x4732Cf95be0d23236e999735a1BFca7988e66b23 |
