# INineLivesTrading
[Git Source](https://github.com/fluidity-money/9lives.so/blob/a3e3525c308d1ecd85b41202701e1c53b0057200/src/INineLivesTrading.sol)


## Functions
### mint

mint some shares in exchange for fUSDC.


```solidity
function mint(bytes8 outcome, uint256 value, address recipient) external returns (uint256);
```
**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`outcome`|`bytes8`|to bet on.|
|`value`|`uint256`|to spend of fUSDC.|
|`recipient`|`address`|of the funds spent.|


### mintPermit

mint some shares in exchange for fUSDC.


```solidity
function mintPermit(bytes8 outcome, uint256 value, uint256 deadline, address recipient, uint8 v, bytes32 r, bytes32 s)
    external
    returns (uint256);
```
**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`outcome`|`bytes8`|to bet on.|
|`value`|`uint256`|to spend of fUSDC.|
|`deadline`|`uint256`|to spend by.|
|`recipient`|`address`|of the funds spent.|
|`v`|`uint8`|to use for the permit signature|
|`r`|`bytes32`|to use for permit.|
|`s`|`bytes32`|to use for permit.|


### decide

decide an outcome. Only callable by the oracle!


```solidity
function decide(bytes8 outcome) external;
```
**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`outcome`|`bytes8`|to set as the winner.|


### payoff

collect the payoff if holding winning shares!


```solidity
function payoff(bytes8 outcomeId, address recipient) external returns (uint256);
```
**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`outcomeId`|`bytes8`|to collect the payoff for.|
|`recipient`|`address`|to send the winnings to.|


### details

details that're available for this outcome.


```solidity
function details(bytes8 outcomeId) external view returns (uint256 shares, uint256 invested, bytes8 winner);
```
**Parameters**

|Name|Type|Description|
|----|----|-----------|
|`outcomeId`|`bytes8`|to get the details for|


### invested

invested amount of fusdc in the betting pool


```solidity
function invested() external view returns (uint256);
```

