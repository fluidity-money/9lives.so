# INineLivesTrading
[Git Source](https://github.com/fluidity-money/9lives.so/blob/a70b8a6a3d94c40f265a10336f5593b66550e4ec/src/INineLivesTrading.sol)


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


