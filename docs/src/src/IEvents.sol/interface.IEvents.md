# IEvents
[Git Source](https://github.com/fluidity-money/9lives.so/blob/a70b8a6a3d94c40f265a10336f5593b66550e4ec/src/IEvents.sol)


## Events
### NewTrading

```solidity
event NewTrading(bytes8 indexed identifier, address indexed addr, address indexed oracle);
```

### OutcomeCreated

```solidity
event OutcomeCreated(bytes8 indexed tradingIdentifier, bytes8 indexed erc20Identifier, address indexed erc20Addr);
```

