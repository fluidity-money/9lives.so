# IEvents
[Git Source](https://github.com/fluidity-money/9lives.so/blob/36a2d1a85e8fd957687655328f8530af8de1f4f1/src/IEvents.sol)


## Events
### NewTrading

```solidity
event NewTrading(bytes8 indexed identifier, address indexed addr, address indexed oracle);
```

### OutcomeCreated

```solidity
event OutcomeCreated(bytes8 indexed tradingIdentifier, bytes8 indexed erc20Identifier, address indexed erc20Addr);
```

