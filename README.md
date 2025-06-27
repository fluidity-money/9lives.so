
# 9Lives

You probably want to read [the guide](https://guide.9lives.so) as a developer!

9lives is the most customisable and advanced prediction market in the web3 ecosystem, with
an orderbook and AMM feature. We can support teams interested in releasing prediction
markets themselves using 9lives, including hosting the graph for you. If you're interested
in this, contact us at [this
link](https://docs.google.com/forms/d/e/1FAIpQLSfYfgLuQ0GU8K5vGj-kU0PciqHHQCCD60T7NHtLLmewkNvldg/viewform?usp=dialog)!

---

9Lives is an Arbitrum Stylus smart contract implemented with a simple factory/pair
pattern. A factory takes a list of outcomes, and creates a variable number of contracts
with a minimal viable proxy pointing to share ERC20s, and a trading contract. It either
supports the Dynamic Pari-Mutuel Market (DPM) model to solve liquidity issues in
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

|        Deployment name        |              Deployment address            |
|-------------------------------|--------------------------------------------|
| Proxy admin                   | `0x6221A9c005F6e47EB398fD867784CacfDcFFF4E7` |
| Factory 1 implementation      | `0x3302ac14ad6b38baf789571395cc3a54f0f65e52` |
| Factory 2 implementation      | `0x928b627add9c2a3578b5c178423724f4d20202ed` |
| Lockup implementation         | `0x99596b476d5e16e4a30bd4858dd289a763671294` |
| Optimistic infra predict impl | `0xf94aeb587d332d0e7f2f1e2c87ffea1385ff0505` |
| Trading DPM mint impl         | `0x7b203ff48f76b163bed86b5f2cb66ce6a46d62d4` |
| Trading DPM extras impl       | `0x81eebeda7eb9f68c9a825c619f5e0d13a117e5f6` |
| Trading DPM price impl        | `0x8fc31d39edec596e8089b313920c05642e86d549` |
| Trading DPM quotes impl       | `0x7439ec52bd28c21f59b07a7a12a09c1f7feac7cf` |
| Trading AMM mint impl         | `0x6aCbBfB83F311F49643ac95d13322e913E953047` |
| Trading AMM extras impl       | `0x1388d394bF0cd3331a6223a1254c1666022487A0` |
| Trading AMM price impl        | `0x1CdeE1E98B9e314d427ca60D0db2a29c463Ab0F5` |
| Trading AMM quotes impl       | `0x8d7E4B67147c86b60b4AcCFA28021F171E800a13` |
| Share implementation          | `0x3e27e934344bf490457231Cb8F0c0eda7d60C362` |
| Lockup token implementation   | `0x70143C674A23a43Ad487D33c4035Ba1D012ac598` |
| Infrastructure market impl    | `0x863642e21a45e824c4f6347a5757e5dcacae11c1` |
| Infrastructure market proxy   | `0xc4451d8477cd6b92bfa0d3e2662ce0507a8e10b9` |
| Lockup proxy                  | `0x20d2360706086ec9814d15a52ad2d2aec2c43caa` |
| Lockup token proxy            | `0x14c35ba87e8b490761f492382c9249867b82aaf4` |
| Factory proxy                 | `0x7dfe1fa7760131140cfc48b3ea99719203d8f00b` |
| Helper factory                | `0x2965aF7dD96D550d63be1577feC27ae26d2C46F7` |
| LensesV1                      | `0xF8cCa1ec8a6268684d888A2013b3567356E76e10` |
| Beauty contest implementation | `0x3421264e413489b1e69ae84ace8c33c6cb7809ff` |
| Beauty contest proxy          | `0x15f4A8a0b8cD0343fAe5a7FC736cD9e0D7bE4d5C` |
| Sarp AI Resolver              | `0x9d73847f1edc930d2a2ee801aeadb4c4567f18e1` |
| Helper factory                | `0x6e95B1fcca9aBb2D94213AE3ccFCaf5BB8406E6B` |
| Buy helper2                   | `0x20a5D83b3A7E475B0CCC482F236C475D39a29854` |
| SARP Signaller                | `0xD608CeF1D7C84feaA0E1520C7a6BC4798cFC1455` |
| Extras beacon proxy factory   | `0x6c1cf52961C567965AFCf495B7af7eCC81411598` |
| Claimant helper               | `0x00FA0a5d3b25Da03ef651045d42B9F7137486b03` |
| Paymaster                     | `0xFe6b36DDb8e72EC5F1c1dC9da99075edCC9833e8` |

### Superposition testnet

|        Deployment name        |              Deployment address              |
|-------------------------------|----------------------------------------------|
| Proxy admin                   | `0xfeb6034fc7df27df18a3a6bad5fb94c0d3dcb6d5` |
| Factory 1 implementation      | `0xc4d1349abae80d4ad470966cce20bb6fc58742b2` |
| Factory 2 implementation      | `0xc3e8901f8bf1b395e5213cc54f5be2a8288559cd` |
| Lockup implementation         | `0x9500564a4f594182eb0fcb12adc945295521c924` |
| Optimistic infra predict impl | `0x64a1d1d8b5770ce5aeca12ace58b699b703b78b1` |
| Trading DPM mint impl         | `0x0000000000000000000000000000000000000000` |
| Trading DPM extras impl       | `0x0000000000000000000000000000000000000000` |
| Trading DPM quotes impl       | `0x0000000000000000000000000000000000000000` |
| Trading DPM price impl        | `0x0000000000000000000000000000000000000000` |
| Trading AMM mint impl         | `0x458321343a09aec4ade38251218d94e454081836` |
| Trading AMM extras impl       | `0x6998f606506c3214d1a9b666b9e910c96eb71b8e` |
| Trading AMM quotes impl       | `0xb65ea61d199a9add83ab9c567aecad0f36241a80` |
| Trading AMM price impl        | `0xad1b31aa97d9488e37ff0502179971043eb0659d` |
| Share implementation          | `0xe008c42B0B748e049812Ed72da7d8a72324786CF` |
| Lockup token implementation   | `0xBC4Fa1Ad69A250606A46A49A5506723f6998F911` |
| Infrastructure market proxy   | `0x05c030a4ab5f59ce0fb7e67dc8e2d2a822b206bb` |
| Lockup proxy                  | `0x6a9f01bbc3e531a589e01246a0f5d11b283fdd9d` |
| Lockup token proxy            | `0xc7dad59cd832019c19346ecb71ea46f9fc9b64af` |
| Factory proxy                 | `0x1e808277ad4568ec0b4206358cb695826e2207b6` |
| Helper factory                | `0x90BD4E4cdb543862Bf5AAfbd036702be4cD93f93` |
| LensesV1                      | `0xFfAB4c9E961935eC297b9da89B7bB68b0403aBE4` |
| Beauty contest implementation | `0x15d10b0a82697c8df8b2428eb7506b83f8b8aa16` |
| Beauty contest proxy          | `0xf08510da798567e6d6029699c6d9b75b739b2913` |
| Sarp AI Resolver              | `0x0000000000000000000000000000000000000000` |
| Claimant helper               | `0xE443aEae0a0704991dfa6b10dA40303931804Dc6` |
| Paymaster                     | `0xe798EB2FB969E6F439F89A8b9490b47Edc1010cf` |
| buy helper                    | `0xC05472e906907aF0b36573f7D7B15AcB47806cC2` |
