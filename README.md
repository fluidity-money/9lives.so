
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
| Factory 1 implementation | 0x8556F2AF170a8a1e321d09C695f00c9BEdc97A0e |
| Factory 2 implementation | 0xA53CA21770E59f1bE75Dd5A32a665651A3992837 |
| ERC20 implementation     | 0x7Ccc810773663d64aB44417eB1352556c5bDE62C |
| Trading mint impl        | 0xAA3B5f45C52bEDddca2281051C2807c017B46850 |
| Trading extras impl      | 0x8774877F44A30Eb90eAB3f38848721253Dd48d1E |
| Factory proxy            |  |
