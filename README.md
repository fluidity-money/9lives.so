
# 9lives

9lives is a prediction market protocol built on [Arbitrum Stylus](https://docs.arbitrum.io/stylus/gentle-introduction), supporting both a Dynamic Pari-Mutuel Prediction Market (DPPM) model and a Constant Product AMM model. The core contracts are written in Rust and compiled to WASM, with supporting Solidity contracts for proxies, the Vault, and the TradingBeacon.

If you're interested in running prediction markets using 9lives (including hosted graph infrastructure), reach out via [this form](https://docs.google.com/forms/d/e/1FAIpQLSfYfgLuQ0GU8K5vGj-kU0PciqHHQCCD60T7NHtLLmewkNvldg/viewform?usp=dialog).

---

## How the contracts work

The system follows a **factory/proxy** pattern. The Factory deploys Trading contract proxies and Share ERC20 proxies for each market. Each Trading contract is a beacon proxy that delegates calls to one of four implementation facets (mint, extras, quotes, price) based on the function selector, looked up via the [TradingBeacon](src/TradingBeacon.sol). There are separate implementations for DPPM and AMM backends, selected at deploy time.

```mermaid
flowchart TD
    Creator -->|Calls newTrading with outcomes, oracle, fees, backend type| Factory
    Factory -->|Deploys beacon proxy via CREATE2| TradingProxy[Trading Proxy]
    Factory -->|Deploys ERC20 proxy per outcome via CREATE2| ShareERC20s[Share ERC20s]
    Factory -->|Borrows seed liquidity for DPPM markets| Vault
    TradingProxy -->|Delegates to facet based on selector| TradingBeacon
    TradingBeacon -->|Routes to| MintImpl[Mint Impl]
    TradingBeacon -->|Routes to| ExtrasImpl[Extras Impl]
    TradingBeacon -->|Routes to| QuotesImpl[Quotes Impl]
    TradingBeacon -->|Routes to| PriceImpl[Price Impl]
    ShareERC20s -->|Minted/burned by| MintImpl
```

### Contract facets

Each Trading contract is split into four facets, each compiled as a separate WASM binary with either the `trading-backend-dppm` or `trading-backend-amm` feature flag. The [TradingBeacon](src/TradingBeacon.sol) maps function selectors to the correct facet address using a byte in the selector:

| Facet | Responsibility | Key functions |
|-------|---------------|---------------|
| **Mint** ([`contract_trading_mint.rs`](src/contract_trading_mint.rs)) | Buying and selling shares | `mint`, `burn` (AMM only) |
| **Extras** ([`contract_trading_extras.rs`](src/contract_trading_extras.rs)) | Constructor, state queries, deciding outcomes | `ctor`, `decide`, `details`, `share_addr`, `outcome_list` |
| **Quotes** ([`contract_trading_quotes.rs`](src/contract_trading_quotes.rs)) | Quoting prices, payoffs, fee queries | `quote`, `payoff`, `fees`, `estimate_burn` |
| **Price** ([`contract_trading_price.rs`](src/contract_trading_price.rs)) | Current prices, liquidity management, fee claiming | `price`, `add_liquidity`, `remove_liquidity`, `claim_all_fees` |

### Trading backends

**DPPM** (Dynamic Pari-Mutuel Prediction Market) -- implemented in [`trading_dppm.rs`](src/trading_dppm.rs):
- Supports exactly 2 outcomes
- Seed liquidity is borrowed from the [Vault](src/Vault.sol) at creation time and repaid at resolution
- Share prices are determined by the ratio of funds invested in each outcome
- Includes a "Ninetails" time-weighted bonus: earlier buyers receive boosted shares that entitle them to a larger portion of the losing side's funds
- Only whitelisted creator addresses (`DPPM_HOUR_CREATOR_ADDR`, `DPPM_15_MIN_CREATOR_ADDR`, `DPPM_5_MIN_CREATOR_ADDR`) can create DPPM markets
- No selling/burning of shares -- positions are held until resolution

**AMM** (Automated Market Maker) -- implemented in [`trading_amm.rs`](src/trading_amm.rs):
- Supports 2+ outcomes
- Uses a constant-product invariant across outcome share pools
- Liquidity providers can add/remove liquidity and earn fees
- Shares can be both minted (bought) and burned (sold) before resolution
- A "shortterm AMM" variant exists for markets using the price resolver oracle, where the Vault provides and reclaims liquidity at resolution

### Supporting contracts

**Vault** ([`Vault.sol`](src/Vault.sol)):
- A shared liquidity pool that lends seed capital to DPPM markets at creation and is repaid at resolution
- For DPPM: the Factory calls `borrow()` at market creation; the Trading contract calls `repay()` at resolution, returning DAO-earned fees to cover the loan
- For shortterm AMM: the Factory calls `ammRegister()`; at resolution the Trading contract either calls `ammReceive()` (if there's a shortfall) or `ammGift()` (if there's a surplus)
- The operator can `drain()` excess funds above outstanding debt

**Share ERC20s** ([`Share.sol`](src/Share.sol)):
- Minimal ERC20 tokens deployed per outcome via CREATE2
- Minted/burned exclusively by the associated Trading contract
- The CREATE2 salt is derived from the trading address + outcome identifier, making addresses deterministic

**Factory** ([`contract_factory_1.rs`](src/contract_factory_1.rs), [`contract_factory_2.rs`](src/contract_factory_2.rs)):
- Split across two facets for code size reasons
- Factory 1: `newTrading` -- deploys trading proxies, share ERC20s, seeds liquidity, registers with oracles
- Factory 2: constructor, admin functions, address lookups, legacy compatibility methods

### Fee structure

Fees are configured per-market at creation time (each capped at <10%):

| Fee | Recipient | Description |
|-----|-----------|-------------|
| Creator fee | Market creator (`fee_recipient`) | Incentive for creating markets |
| LP fee | Liquidity providers (AMM only) | Reward for providing liquidity |
| Minter fee | Protocol (`DAO_EARN_ADDR`) | Protocol revenue |
| Referrer fee | Referrer address | Paid when a referrer is specified on mint |
| Protocol fee | Protocol | Fixed 0.8% on all mints |

---

## Project structure

```
src/
  lib.rs                          # Crate root, feature-gated entrypoint selection
  contract_factory_1.rs           # Factory: market creation (newTrading)
  contract_factory_2.rs           # Factory: admin, queries, legacy compat
  storage_factory.rs              # Factory storage layout
  contract_trading.rs             # Trading: feature gate that selects the active facet
  contract_trading_mint.rs        # Trading facet: mint/burn shares
  contract_trading_extras.rs      # Trading facet: ctor, state, decide
  contract_trading_quotes.rs      # Trading facet: quotes, payoff, fees
  contract_trading_price.rs       # Trading facet: price, liquidity, fee claiming
  contract_trading_extras_admin.rs # Trading facet: admin-only operations
  contract_trading_dumper.rs      # Trading facet: emergency dumper
  storage_trading.rs              # Trading storage layout
  trading_dppm.rs                 # DPPM backend: mint, payoff, price logic
  trading_amm.rs                  # AMM backend: mint, burn, liquidity, price logic
  trading_private.rs              # Shared trading internals: ctor, decide, fees, shutdown
  immutables.rs                   # Compile-time addresses and constants
  fees.rs                         # Fee constants (bonds, incentives, protocol %)
  maths.rs                        # Math helpers (DPPM share calc, sqrt, mul_div)
  proxy.rs                        # CREATE2 proxy deployment helpers
  error.rs                        # Error types and codes (see ERRORS.md)
  events.rs                       # Event definitions
  Vault.sol                       # Vault: shared liquidity pool (Solidity)
  TradingBeacon.sol               # Beacon: maps selectors to facet impls (Solidity)
  Share.sol                       # Share ERC20 (Solidity, compiled with Foundry)
  NineLivesPaymaster.sol          # Paymaster for gasless transactions (Solidity)
tests/                            # Property tests, e2e tests, reference implementations
db/                               # Database migrations (PostgreSQL)
cmd/                              # Backend services (Go): GraphQL API, ingestor, paymaster, etc.
web/                              # Frontend (TypeScript)
```

### Feature flags

Each contract facet is compiled as a separate WASM binary using Cargo feature flags. Exactly one `contract-*` feature must be enabled per build, and trading facets additionally require either `trading-backend-dppm` or `trading-backend-amm`:

| Feature | Contract |
|---------|----------|
| `contract-factory-1` | Factory (market creation) |
| `contract-factory-2` | Factory (admin/queries) |
| `contract-trading-mint` + `trading-backend-dppm` | DPPM mint facet |
| `contract-trading-mint` + `trading-backend-amm` | AMM mint facet |
| `contract-trading-extras` + backend | Extras facet |
| `contract-trading-quotes` + backend | Quotes facet |
| `contract-trading-price` + backend | Price facet |
| `testing` | Required for non-WASM builds (unit/property tests) |

---

## Building

Build all contract WASM binaries and Solidity artifacts:

```sh
make build
```

This compiles each facet separately (see the [Makefile](Makefile) for the full list of targets). Solidity contracts are built with Foundry:

```sh
forge build
```

### Environment variables

The Rust contracts read deployment addresses at compile time from environment variables (see [`immutables.rs`](src/immutables.rs)). Key variables include:

- `SPN_FUSDC_ADDR` -- fUSDC token address
- `SPN_STAKED_ARB_ADDR` -- Staked ARB token address
- `SPN_TRADING_BEACON_ADDR` -- TradingBeacon contract address
- `SPN_VAULT_ADDR` -- Vault contract address
- `SPN_SHARE_IMPL_ADDR` -- Share ERC20 implementation address
- `SPN_DAO_EARN_ADDR` -- DAO fee recipient
- `SPN_DAO_OP_ADDR` -- DAO operator (admin)

See [`immutables.rs`](src/immutables.rs) for the full list. When the `testing` feature is enabled, these are replaced with hardcoded test addresses from [`testing_addrs.rs`](src/testing_addrs.rs).

## Testing

Unit and property tests run natively (not in WASM). The `testing` feature must be enabled:

```sh
./tests.sh
```

Mutation testing with `cargo-mutants` and `cargo-nextest` (slow, resource-intensive):

```sh
./mutants.sh
```

`PROPTEST_CASES` controls the number of property test iterations (default in CI: 10, proptest default: 256).

End-to-end tests in `tests/` use a bespoke harness that deploys contracts to a local Arbitrum node. The `build.rs` script reads `environment.lst` files to track deployment addresses:

```sh
# List all recorded environment variables from a fresh deploy
sort $(find target -name environment.lst) | uniq

# Clear recorded variables
find target -name environment.lst -delete
```

For debugging reverts, build with debug info and use `stylus-interpreter` to simulate calldata against the WASM binary.

## Errors

See [ERRORS.md](ERRORS.md) for the full error code table. Generate it with:

```sh
./print-error-table.sh
```

## Audits

- [Dadekuma (December 2024)](audits/Dadekuma-12-2024.pdf)
- [OpenZeppelin (November 2025)](audits/OpenZeppelin-11-2025.pdf)

See [audits/README.md](audits/README.md) for details.

## Deployments

### Arbitrum mainnet

|        Deployment name        |              Deployment address            |
|-------------------------------|--------------------------------------------|
| Proxy admin                   | `0x58A5f520FF7A6F59863e8a73b066A975799d5d48` |
| Emergency council             | `0x6221a9c005f6e47eb398fd867784cacfdcfff4e7` |
| Trading DPPM mint impl        | `0x0000000000000000000000000000000000000000` |
| Trading DPPM extras impl      | `0x0000000000000000000000000000000000000000` |
| Trading DPPM quotes impl      | `0x0000000000000000000000000000000000000000` |
| Trading DPPM price impl       | `0x0000000000000000000000000000000000000000` |
| Trading AMM mint impl         | `0x9ad593d14340366d78cb87436050fe3a38a92694` |
| Trading AMM extras impl       | `0xe421ea1da03c45207437a53fc3b5cea6017f2368` |
| Trading AMM quotes impl       | `0x5a592a787a925aaf8dfcee8e99c591095bb3045c` |
| Trading AMM price impl        | `0x5b60a793bccac54a2430420e6e8cc814e97ad85e` |
| Share implementation          | `0x87f03D061C1e92802e2A9969E93Ff30f0C178230` |
| Factory proxy                 | `0x90234c942f335df8c055b9c1a2e0babf060a31ad` |
| Helper factory                | `0x263735150e8b48FF6bF471DB94f113e9994C333d` |
| Trading beacon                | `0x5F2BD61Bb7e4a8008e0725F8AbB977cbe41FcfD5` |
| LensesV1                      | `0xA28CCAf4E66276AA8e1635596cc9494107A0fDA9` |
| Sarp AI Resolver              | `0xa81a0adab3492dae14c45c39d322a78a24c8b683` |
| Claimant helper               | `0xf8Da8d65120b317331C79092Bf65e99bed6e65dE` |
| Paymaster                     | `0xA19B3a76d5744825c3672a5FFE1F4F5Aee3F28dE` |
| Paymaster caller              | `0x132abdc1eca9b55a2ce3a48cec4a3d443301dc06` |
| USDC                          | `0xaf88d065e77c8cC2239327C5EDb3A432268e5831` |
| Camelot swap router           | `0x1f721e2e82f6676fce4ea07a5958cf098d339e18` |
| Stargate                      | `0xe8CDF27AcD73a434D661C84887215F7598e7d0d3` |
| WETH                          | `0x82af49447d8a07e3bd95bd0d56f35241523fbab1` |
| DPPM hour creator             | `0xF42cC58DA660e0f04e318372280ECCc26733757c` |
| DPPM 15 min creator           | `0xF42cC58DA660e0f04e318372280ECCc26733757c` |
| DPPM 5 min creator            | `0xF42cC58DA660e0f04e318372280ECCc26733757c` |
| Oracle                        | `0xA2cFa0E8dD8abD255343c9ab6D36f3306Ad3A6aB` |
| Buy helper                    | `0xAa901219528e22aC1E3a3bDc40a34Eab7983d240` |
| Vault                         | `0xE45C182512e18982522B620EDfF0D9C56c294C08` |
| Authority                     | `0x982158348B3f1Af92DB33671BC7C70c46ee2cbb8` |

Several "precompiles" are in use, provided by superposition-precompiles.

## License

See [LICENSE](LICENSE).
