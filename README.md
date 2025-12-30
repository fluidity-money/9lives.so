
# 9lives

9lives is the most customisable and advanced prediction market in the web3 ecosystem, with
a liquidity free bootstrapping model titled the DPPM, and an AMM feature. We can support
teams interested in releasing prediction markets themselves using 9lives, including
hosting the graph for you. If you're interested in this, contact us at [this
link](https://docs.google.com/forms/d/e/1FAIpQLSfYfgLuQ0GU8K5vGj-kU0PciqHHQCCD60T7NHtLLmewkNvldg/viewform?usp=dialog)!

---

9lives is an Arbitrum Stylus smart contract implemented with a simple factory/pair
pattern. A factory takes a list of outcomes, and creates a variable number of contracts
with a minimal viable proxy pointing to share ERC20s, and a trading contract. It either
supports the Dynamic Pari-Mutuel Prediction Market (DPPM) model to solve liquidity issues
in orderbooks, or a Constant Product Market Maker model hosted entirely in contract.

To get started with the contract entrypoint, src/lib.rs contains the matching of features
to deploy different contract facets. Testing is done with a mixture of property and
mutation testing and a bespoke testing environment for ERC20 accounting and more.

Inventors create campaigns (the prediction markets) by locking up "incentive" amounts, and
by picking the type of oracle they want to use. Any fees earned in the campaign are sent
to the Inventor, which provides incentive to create markets. Markets must be created with
a hard deadline and a Beauty Contest or a Infrastructure Market, or with a Contract
Interaction type of outcome. The Inventor must communicate to the Factory which oracle
they would like to use, and provide the hash of the string that must be used to determine
the outcome. This will then set the correct behaviour.

```mermaid
flowchart TD
    Trader --> |Locks up incentive amount, sets parameters| Factory
    Factory --> |Sets start, end, description, if infra market oracle chosen| Infra[Infra market]
    Factory --> |Deploys contract. Sets parameters| Trading
    Factory --> |Configures Longtail pool| Longtail
    Factory --> |Deploys ERC20 assets for each outcome| ERC20s
    Trading --> |Disables Longtail once trading is done| Factory
    ERC20s --> |Burns and mints supply| Trading
    Infra --> |Tells Trading who won| Trading
```

Infra Markets are prediction markets where Staked ARB is locked up as LARB, which is used
to predict the outcome of another prediction market with a commit and reveal scheme. These
markets exist in an optimistic state where anyone can "call" the outcome, before being
challenged with a "whinge", which begins the process of a commit and reveal system.
Following this, amounts can be claimed with a slashing process based on amounts staked.

Oracle State oracles are very simple comparatively, as presumably the associated Trading
contract was configured to allow early activation, so all a caller must do is activate the
associated Oracle State contract. These could communicate with LayerZero to pull
information from another chain, and the contract will simply check the result of the
message. If it's not activated by the date that's given, then it defaults to a "DEFAULT"
clause that could be "no" if a user were to try to estimate the price of something.

---

![Diagram of the system](diagram.svg)

## Building contracts

	make build

## Updating docs (after editing markdown files)

	forge doc -b

## Testing

Testing must be done with no trading or contract feature enabled. Testing is only possible
on the local environment, or with end to end tests with an Arbitrum node.

	./tests.sh

Testing coverage can be measured using mutation testing and `cargo-nextest`. This can be
quite heavy, and will take a long time to run. `proptest` is configured using `PROPTEST_CASES`
to reduce the time to 10, instead of the default 256.

	./mutants.sh

Interrogation of the deployment in the end to end testing library could be done using the
`build.rs` use of `environment.lst`, which could be in turn read with a fresh deploy (and
a clean artifacts directory):

	sort $(find target -name environment.lst) | uniq

You could clear the recorded environment variables the same way with a test harness:

	find target -name environment.lst -delete

You could use this to test the code by making a debug build, which includes more
information about reverts, then simulate your calldata against it using
`stylus-interpreter`, making debugging a breeze.

## Errors

The error table lives in ERRORS.md.

## Deployments

### Superposition mainnet

|        Deployment name        |              Deployment address              |
|-------------------------------|----------------------------------------------|
| Proxy admin                   | `0x6221A9c005F6e47EB398fD867784CacfDcFFF4E7` |
| Factory 1 implementation      | `0x7b6bfdc06d37935f3946b8690cf9d14244dbfd52` |
| Factory 2 implementation      | `0x40ad64826b745f30d3cac75c60b5dc725b719cd0` |
| Lockup implementation         | `0x99596b476d5e16e4a30bd4858dd289a763671294` |
| Optimistic infra predict impl | `0xf94aeb587d332d0e7f2f1e2c87ffea1385ff0505` |
| Trading DPPM mint impl        | `0xd4f227042d083a358edb90e07fb7da4bdda059f3` |
| Trading DPPM extras impl      | `0x93f79a894f19b1168033d41204ccd335c982fcc0` |
| Trading DPPM price impl       | `0xeee77d61f2a8d6a9eac127f2d31ee1d55648451b` |
| Trading DPPM quotes impl      | `0xe6257d33b241ab40b1c095c77580f426a5269466` |
| Trading AMM mint impl         | `0x858f37b9d3aa15e0df2ca9d427febf9a47344f19` |
| Trading AMM extras impl       | `0xb3127f0083eb4c03a21b917656575ac766d46369` |
| Trading AMM price impl        | `0x3fcae4ee12564f606c2dd34759f32a884f28a516` |
| Trading AMM quotes impl       | `0xe25f8210f710ca3582214239d32aeb42841117cf` |
| Share implementation          | `0x3e27e934344bf490457231Cb8F0c0eda7d60C362` |
| Lockup token implementation   | `0x70143C674A23a43Ad487D33c4035Ba1D012ac598` |
| Infrastructure market impl    | `0x863642e21a45e824c4f6347a5757e5dcacae11c1` |
| Infrastructure market proxy   | `0xc4451d8477cd6b92bfa0d3e2662ce0507a8e10b9` |
| Lockup proxy                  | `0x20d2360706086ec9814d15a52ad2d2aec2c43caa` |
| Lockup token proxy            | `0x14c35ba87e8b490761f492382c9249867b82aaf4` |
| Factory proxy                 | `0x7dfe1fa7760131140cfc48b3ea99719203d8f00b` |
| Helper factory                | `0x5Da3fC34FFF02faaDDf71eD6C0Bc9928C747f8fE` |
| LensesV1                      | `0x8036d656D2E0c36d90DF47b7Da625fDC16375f87` |
| Beauty contest implementation | `0xb7f978f707dc03b392d7215426cf98dc812d9454` |
| Beauty contest proxy          | `0x15f4A8a0b8cD0343fAe5a7FC736cD9e0D7bE4d5C` |
| Sarp AI Resolver              | `0x9d73847f1edc930d2a2ee801aeadb4c4567f18e1` |
| Helper factory                | `0x937AB18278f8a11D1E7129f58A3Cdb026A16aD5a` |
| BuyHelper2                    | `0x7aD7eDd9A72512335e2A7A980047Ec2eD233D21c` |
| SARP Signaller                | `0xD608CeF1D7C84feaA0E1520C7a6BC4798cFC1455` |
| Extras beacon proxy factory   | `0x6c1cf52961C567965AFCf495B7af7eCC81411598` |
| Claimant helper for claim     | `0xD77ae359A5A12F04c4ABFE7D5B511E0990CE6F6C` |
| Paymaster implementation      | `0x552BbaEc8D75c010435C810fA890B3E03e9C6445` |
| Paymaster proxy               | `0xE990f05e2264f56435Fd7589FA2F70A879B0cE9f` |
| Stargate                      | `0x8EE21165Ecb7562BA716c9549C1dE751282b9B33` |
| Price resolver oracle         | `0xa2cfa0e8dd8abd255343c9ab6d36f3306ad3a6ab` |
| Trading beacon                | `0xfA433744C5C496c7caD243c61A17167DD39AE8ee` |
| Vault                         | `0xe7569919F3088B09aC07aE239295F209522a99B3` |
