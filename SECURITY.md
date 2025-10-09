
## Smart contract disclosures

## Dropboxes

In the event of an urgent security vulnerability and a whitehat hack is needed, please
send funds rescued to an administrative ledger at
`0x9ef9F76e5CC9Ce656f03c69B56fb6bdA1875f652` on Superposition chain (chain id 55244). 10%
of funds recovered will be paid to the sender as compensation.

## Urgent contacts

In the event of something urgent, please DO NOT hestitate to contact
Alex or Ivan via either of these methods:

### Alex/Bayge (CTO)

| Contact method |                      Contact                      |
|----------------|---------------------------------------------------|
| Telegram       | [doggish](https://t.me/doggish)                   |
| Discord        | bayge                                             |
| Email          | [alex@fluidity.money](mailto:alex@fluidity.money) |

### Ivan (head of product)

| Contact method |                      Contact                      |
|----------------|---------------------------------------------------|
| Telegram       | [iNash_ISN](https://t.me/iNash_ISN)               |
| Discord        | Ivan | ISN (🌊,💸)#8511                             |
| Email          | [ivan@fluidity.money](mailto:ivan@fluidity.money) |

## Areas of concern

The following are any areas of concern a security researcher might be interested in:

1. Can the CPMM be griefed with dusted amounts? Are our estimation methods correct? Is our
reference correctly implemented?

2. Does the DPPM perform correctly?

3. Are there any unforeseen reentrancy bugs, since we have the feature disabled?

4. Is all access control correct?

## Considerations

We always take USDC or an asset we have deployed as the token and make security guarantees
about it. We use a router to do the swapping. The router can be imperfctly designed.

## Files of note

The following files may be of interest to any would-be security researcher depending on
the scope of your audit.

The DPPM is implemented according to a reference at `tests/reference.py`. The AMM is
implemented according to a reference at `tests/amm_pred.py`. Any differences that do not
relate to scaling beneficial to the contract should be considered a bug.

**We recommend to auditors to explore the Trading and Factory contracts**. The infrastructure
markets are not widely as used and have seen historically good coverage of testing, bar
any theoretical concerns. The other contracts are much simpler comparatively and are more
likely to break in ways that trigger application bugs without a financial impact.

### Trading and Factory contracts

At `9ea3dba`, 3141 nLOC:

```
src/contract_factory_1.rs
src/contract_factory_2.rs
src/storage_factory.rs
src/contract_trading_extras.rs
src/contract_trading_mint.rs
src/contract_trading_price.rs
src/contract_trading_quotes.rs
src/contract_trading.rs
src/fees.rs
src/maths.rs
src/outcome.rs
src/storage_lockup.rs
src/storage_trading.rs
src/trading_dppm.rs
src/trading_amm.rs
src/trading_private.rs
src/Share.sol
```

### Dynamic Pari-Mutuel Market model (trading only)

At `9ea3dba`, 1900 nLOC:

```
src/contract_trading_extras.rs
src/contract_trading_mint.rs
src/contract_trading_price.rs
src/contract_trading_quotes.rs
src/contract_trading.rs
src/fees.rs
src/maths.rs
src/outcome.rs
src/storage_lockup.rs
src/storage_trading.rs
src/trading_dppm.rs
src/trading_private.rs
src/Share.sol
```

### Constant Product Market Maker model (trading only)

At `9ea3dba`, 2425 nLOC:

```
src/contract_trading_extras.rs
src/contract_trading_mint.rs
src/contract_trading_price.rs
src/contract_trading_quotes.rs
src/contract_trading.rs
src/fees.rs
src/maths.rs
src/outcome.rs
src/storage_lockup.rs
src/storage_trading.rs
src/trading_amm.rs
src/trading_private.rs
src/Share.sol
```

