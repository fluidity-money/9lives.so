# Share
[Git Source](https://github.com/fluidity-money/9lives.so/blob/a70b8a6a3d94c40f265a10336f5593b66550e4ec/src/Share.sol)

**Inherits:**
Initializable, ERC20Upgradeable, OwnableUpgradeable, ERC20PermitUpgradeable


## Functions
### constructor


```solidity
constructor();
```

### ctor


```solidity
function ctor(bytes8 identifier, address admin) public initializer;
```

### mint


```solidity
function mint(address to, uint256 amount) public onlyOwner;
```

### burn


```solidity
function burn(address owner, uint256 value) public onlyOwner;
```

