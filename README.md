
# 9lives

You probably want to read [the guide](https://guide.9lives.so) as a developer!

9lives is the most customisable and advanced prediction market in the web3 ecosystem, with
an orderbook and AMM feature. We can support teams interested in releasing prediction
markets themselves using 9lives, including hosting the graph for you. If you're interested
in this, contact us at [this
link](https://docs.google.com/forms/d/e/1FAIpQLSfYfgLuQ0GU8K5vGj-kU0PciqHHQCCD60T7NHtLLmewkNvldg/viewform?usp=dialog)!

---

9lives is an Arbitrum Stylus smart contract implemented with a simple factory/pair
pattern. A factory takes a list of outcomes, and creates a variable number of contracts
with a minimal viable proxy pointing to share ERC20s, and a trading contract. It either
supports the Dynamic Pari-Mutuel Market (DPPM) model to solve liquidity issues in
orderbooks, or a Constant Product Market Maker model to be totally separate.

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

## Roadmap

- [X] UX improvements (shares are more visible, smart account behaviour)
- [X] Mainnet is supported as well. Mainnet has disclosure that funds are locked up until the election is over.
- Achievements and portfolio page is supported. Some socialfi elements.
    1. [ ] Users can choose their favourite achievements to display in a minified form next to their Meow Domain.
    2. [X] Meow domains is supported in the UI.
- [X] Collect payoff from the campaign ending in the frontend.
- [X] Custom fee collection and pool configuration supported (use beauty contest with fixed date, many outcomes if they want)
- Anyone can create pools. Custom display of pools a la Ebay customisation.
    1. [X] A fixed fee is sent to creator of when shares are created.
    2. [X] Behind the scenes deferring to the AMM model if more than two outcomes.
    3. [X] Customise the UI of the frontpage for the info
    4. [X] Stack ranking is done for automated updating of frontpage
    5. [ ] Campaign report functionality. Images are screened automatically for bad content with CSAM
    6. [ ] API to update campaign by the original sender
    9. [ ] Custom embed when sharing URL
- [ ] Prediction market DAO. Token launch

## Building contracts

	make build

## Updating docs (after editing markdown files)

	forge doc -b

## Testing

Testing must be done with no trading or contract feature enabled. Testing is only possible
on the local environment, or with end to end tests with an Arbitrum node.

	./tests.sh

Interrogation of the deployment in the end to end testing library could be done using the
`build.rs` use of `environment.lst`, which could be in turn read with a fresh deploy (and
a clean artifacts directory):

	sort $(find target -name environment.lst) | uniq

You could clear the recorded environment variables the same way with a test harness:

	rm $(find target -name environment.lst)

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
| Factory 1 implementation      | `0x58b4a0947bfa1022cd853e4058d8d217aca4bcc7` |
| Factory 2 implementation      | `0x7ec69f0785dbb944c57fc98e89e244710d00600b` |
| Lockup implementation         | `0x99596b476d5e16e4a30bd4858dd289a763671294` |
| Optimistic infra predict impl | `0xf94aeb587d332d0e7f2f1e2c87ffea1385ff0505` |
| Trading DPPM mint impl        | `0x8c6f1ac8cfffa4207127dc985d510e5aaa76f0c2` |
| Trading DPPM extras impl      | `0xea9a1b3b0a5987b882fe770cd89ba352be1419f2` |
| Trading DPPM price impl       | `0xfd11d4fcae3b18937589cde65a160a61ea87e1c1` |
| Trading DPPM quotes impl      | `0x029992ae712ce8195591d9b68c54ab36e0e69bd1` |
| Trading AMM mint impl         | `0x858f37b9d3aa15e0df2ca9d427febf9a47344f19` |
| Trading AMM extras impl       | `0x3ffdb4f0a9ed693bdcb6678f14988d754514186c` |
| Trading AMM price impl        | `0xb393ea32f302a9cc798f8296f5328172096553d2` |
| Trading AMM quotes impl       | `0x86c9a10e234165feff47f3c113f11f63247f9c0f` |
| Share implementation          | `0x3e27e934344bf490457231Cb8F0c0eda7d60C362` |
| Lockup token implementation   | `0x70143C674A23a43Ad487D33c4035Ba1D012ac598` |
| Infrastructure market impl    | `0x863642e21a45e824c4f6347a5757e5dcacae11c1` |
| Infrastructure market proxy   | `0xc4451d8477cd6b92bfa0d3e2662ce0507a8e10b9` |
| Lockup proxy                  | `0x20d2360706086ec9814d15a52ad2d2aec2c43caa` |
| Lockup token proxy            | `0x14c35ba87e8b490761f492382c9249867b82aaf4` |
| Factory proxy                 | `0x7dfe1fa7760131140cfc48b3ea99719203d8f00b` |
| Helper factory                | `0xC555D6819C9293ec0A703dF4A5CcDAF0BdEdD1Cd` |
| LensesV1                      | `0x8036d656D2E0c36d90DF47b7Da625fDC16375f87` |
| Beauty contest implementation | `0xb7f978f707dc03b392d7215426cf98dc812d9454` |
| Beauty contest proxy          | `0x15f4A8a0b8cD0343fAe5a7FC736cD9e0D7bE4d5C` |
| Sarp AI Resolver              | `0x9d73847f1edc930d2a2ee801aeadb4c4567f18e1` |
| Helper factory                | `0x25F4506E82fac0021C17a3595452B0D03D0c742D` |
| BuyHelper2                    | `0x7aD7eDd9A72512335e2A7A980047Ec2eD233D21c` |
| SARP Signaller                | `0xD608CeF1D7C84feaA0E1520C7a6BC4798cFC1455` |
| Extras beacon proxy factory   | `0x6c1cf52961C567965AFCf495B7af7eCC81411598` |
| Claimant helper               | `0x00FA0a5d3b25Da03ef651045d42B9F7137486b03` |
| Paymaster implementation      | `0x552BbaEc8D75c010435C810fA890B3E03e9C6445` |
| Paymaster proxy               | `0xE990f05e2264f56435Fd7589FA2F70A879B0cE9f` |
| Stargate                      | `0x8EE21165Ecb7562BA716c9549C1dE751282b9B33` |

### Superposition testnet

|        Deployment name        |              Deployment address            |
|-------------------------------|--------------------------------------------|
| Proxy admin                   | `0xfeb6034fc7df27df18a3a6bad5fb94c0d3dcb6d5` |
| Factory 1 implementation      | `0xfe2abd224b193d7e71603648be18d86494090ce6` |
| Factory 2 implementation      | `0x1b819633bf6a86abfe0a36a827d1a21e48136988` |
| Lockup implementation         | `0xaf1d785c71749390fda7fae7ac94db8b5783075e` |
| Optimistic infra predict impl | `0xad425edab6c94e2f9f0d1b2bba59bb5d18673c52` |
| Trading DPPM mint impl        | `0x0000000000000000000000000000000000000000` |
| Trading DPPM extras impl      | `0x0000000000000000000000000000000000000000` |
| Trading DPPM quotes impl      | `0x0000000000000000000000000000000000000000` |
| Trading DPPM price impl       | `0x0000000000000000000000000000000000000000` |
| Trading AMM mint impl         | `0xf79fc540aa17e71f2d475de7a6962b5e5e5f54dc` |
| Trading AMM extras impl       | `0xaabe32254d850521ee0511aee6b165e6bea2b838` |
| Trading AMM quotes impl       | `0x628875b043b2863f7e90f10eb80dd2b74c2e9250` |
| Trading AMM price impl        | `0x2216a510742221cbf2078612f773eca4434af141` |
| Share implementation          | `0x57Dbe6699441636Ed0730e07ac3c8A3e9fF5879b` |
| Lockup token implementation   | `0x2bDd60d3bf40762D214655E876d8D9BE576EaD3D` |
| Infrastructure market proxy   | `0xfbab524c5afdc95bc5c61ced8555875bfc76c96e` |
| Lockup proxy                  | `0x09cfac6adafba8612c5813ca6091bc3a5b2df638` |
| Lockup token proxy            | `0x1e9a5f8a0aab7051e31bdcf109cecd31154bcaac` |
| Factory proxy                 | `0x23ff36d696e7ddcf1ad4041c1c3a26a9e39eb107` |
| Helper factory                | `0x7981902295474DD10F323A0BFeaF0b54Eb77a7Ef` |
| LensesV1                      | `0xb5f6B68b9E8E8a5eBa1288291AAfbe026DE5ce67` |
| Beauty contest implementation | `0x8030b6db88b33f875e4a2cc19208844e3f5f897d` |
| Beauty contest proxy          | `0xfa120236026e35eb9bdea6c38ad3b571ca1d01c2` |
| Sarp AI Resolver              | `0x0000000000000000000000000000000000000000` |
| Claimant helper               | `0x8910D0975DC2FF98a462C507531AA3Ee00C4603B` |
| Paymaster                     | `0x64dAf14239A980969ACe1900A34C8a098AD21A8d` |
