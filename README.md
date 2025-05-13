
# 9Lives

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
| Trading AMM mint impl         | `0x3718df456099e86456fda7196d37d0cbd2325753` |
| Trading AMM extras impl       | `0x59c9660f835c1c1c5387a48b9fe8cf7d49020a64` |
| Trading AMM price impl        | `0x7ff05c8bac0bce55e1519015a4a86fe2b244df88` |
| Trading AMM quotes impl       | `0xfa97df8d72caefecd838b051f0d33236097906e8` |
| Share implementation          | `0x3e27e934344bf490457231Cb8F0c0eda7d60C362` |
| Lockup token implementation   | `0x70143C674A23a43Ad487D33c4035Ba1D012ac598` |
| Infrastructure market impl    | `0x863642e21a45e824c4f6347a5757e5dcacae11c1` |
| Infrastructure market proxy   | `0xc4451d8477cd6b92bfa0d3e2662ce0507a8e10b9` |
| Lockup proxy                  | `0x20d2360706086ec9814d15a52ad2d2aec2c43caa` |
| Lockup token proxy            | `0x14c35ba87e8b490761f492382c9249867b82aaf4` |
| Factory proxy                 | `0x7dfe1fa7760131140cfc48b3ea99719203d8f00b` |
| Helper factory                | `0x2965aF7dD96D550d63be1577feC27ae26d2C46F7` |
| LensesV1                      | `0x051648539bC4a1C247030EABCBC29cfD1887cd83` |
| Beauty contest implementation | `0x3421264e413489b1e69ae84ace8c33c6cb7809ff` |
| Beauty contest proxy          | `0x15f4A8a0b8cD0343fAe5a7FC736cD9e0D7bE4d5C` |
| Sarp AI Resolver              | `0x9d73847f1edc930d2a2ee801aeadb4c4567f18e1` |
| Helper factory                | `0x6e95B1fcca9aBb2D94213AE3ccFCaf5BB8406E6B` |
| Buy helper2                   | `0xEBBfeAcbbD331466512A362BEa782e1f7CB45b57` |
| SARP Signaller                | `0xD608CeF1D7C84feaA0E1520C7a6BC4798cFC1455` |

### Superposition testnet

|        Deployment name        |              Deployment address            |
|-------------------------------|--------------------------------------------|
| Proxy admin                   | `0xfeb6034fc7df27df18a3a6bad5fb94c0d3dcb6d5` |
| Factory 1 implementation      | `0xcae24871c4e581b8a2e7d19254e5cf423d1a4647` |
| Factory 2 implementation      | `0x8fa9dcafdbecf164597ba4f7fb2b6a45f404df6f` |
| Lockup implementation         | `0xcb96e461d6792ece719a59be0cc4fbeb52b2c550` |
| Optimistic infra predict impl | `0x6d7505d41de749fc92e22105c22c4b676219fb8f` |
| Trading DPM mint impl         | `0x11a4b84a7d0979e906c8eaba7c16579a3bf48bf5` |
| Trading DPM extras impl       | `0xbd03aff1a558d0806eed2e6e6af48453daf4de40` |
| Trading DPM quotes impl       | `0xccf0aed8c4157cfbc41ad0cd78b23c6fd637271e` |
| Trading DPM price impl        | `0x653b2142f0a1a2c74c8568f64e1b129fcecb6bda` |
| Trading AMM mint impl         | `0x82e9d4005807b0be8abbe1428e315afd0c378494` |
| Trading AMM extras impl       | `0xc19afda1236fbca573e22f1ccef5a7bb8b77eb6b` |
| Trading AMM quotes impl       | `0x710eba29706cdf5c7888962828dc12c9c6477e6a` |
| Trading AMM price impl        | `0xf51550db2a930fcec9b88ca9227d8b2c47f22db6` |
| Share implementation          | `0x32178507636874814F61b5DF82883bcC17698433` |
| Lockup token implementation   | `0xfC629F4d6AdfF23dC664cd0CE6396E6cD68aD582` |
| Infrastructure market proxy   | `0x971faec2459c8bf9997664c542d759c307ebf6b7` |
| Lockup proxy                  | `0xa591244c9d63d6b75812d12306696a6de1c65cdd` |
| Lockup token proxy            | `0x536fb52640d1850330a4e47cdd137a39d58ce154` |
| Factory proxy                 | `0xb4b0ad63b38125d9efe489879feea48af70fa144` |
| Helper factory                | `0xaFf9412504C7899EB3Fb7123593934ae998a7515` |
| LensesV1                      | `0x1d75C37ede0bAFD468Ee0F663D086ae2FEdaD138` |
| Beauty contest implementation | `0x17bf9a9660373b3955bc69c38794cfed29735850` |
| Beauty contest proxy          | `0x8ffae175f29bad429fa1e1fe7ff20555a83bd915` |
| Sarp AI Resolver              | `0x0000000000000000000000000000000000000000` |
| Buy helper2                   | `0x0Fd540cfb40941dc47C3A6B6559F7ffEc2010180` |
| SARP Signaller                | `0x2137B4C506f0d7eF2A562B02Be9110a4a3A93bC9` |
