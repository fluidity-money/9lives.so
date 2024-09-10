# INineLivesTrading
[Git Source](https://github.com/fluidity-money/9lives.so/blob/36a2d1a85e8fd957687655328f8530af8de1f4f1/src/INineLivesTrading.sol)


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


