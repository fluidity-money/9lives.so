// SPDX-License-Identifier: MIT
// Compatible with OpenZeppelin Contracts ^5.0.0
pragma solidity ^0.8.18;

import "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/extensions/ERC20PermitUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

import "@openzeppelin/contracts/utils/Strings.sol";

contract Share is
    Initializable,
    ERC20Upgradeable,
    OwnableUpgradeable,
    ERC20PermitUpgradeable
{
    constructor() {
        _disableInitializers();
    }

    function ctor(bytes8 identifier, address admin) initializer public {
        string memory name = string.concat(
            "9lives Share #",
            Strings.toString(uint256(uint64(identifier)))
        );
        string memory symbol = string.concat(
            "9#",
            Strings.toString(uint256(uint64(identifier)))
        );
        __ERC20_init(name, symbol);
        __Ownable_init(admin);
        __ERC20Permit_init(name);
    }

    function decimals() public override pure returns (uint8) {
        return 6;
    }

    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }

    function burn(address owner, uint256 value) public onlyOwner {
        _burn(owner, value);
    }
}
