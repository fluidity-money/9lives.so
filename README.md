
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
| Factory 1 implementation | 0xAc5AA7C223de8FF5C70a5A6E47A4265249089420 |
| Factory 2 implementation | 0xEAEFb394b3da276f0ff9191ed6bD38e9d354BA35 |
| ERC20 implementation     | 0x0D6E63Eb9F260F3DC9DF2CfF402029a3EA2659eB |
| Trading mint impl        | 0x3253fc6302C92C8eEe2AFa28C434a296cB41b3D3 |
| Trading extras impl      | 0xF1f1eacd0419b4666e79a7FbA9d96AE86Eea3662 |
| Factory proxy            | 0xe74A3A56016503A2115A316d8c674eAFD64848b6 |
| LensesV1                 | 0x24E0df39ab2353328f833c0602942a930087911A |
