// SPDX-License-Identifier: MIT
// Compatible with OpenZeppelin Contracts ^5.0.0
pragma solidity ^0.8.20;

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

    function ctor(string calldata name, address admin) initializer public {
        string memory newName = string.concat(
            "9lives #",
            /// We do this to protect the user from being distracted by other tokens.
            Strings.toString(uint256(uint8(uint256(
                keccak256(abi.encodePacked(block.timestamp)
            ))))),
            " ",
            name
        );
        bytes8 id = bytes8(keccak256(abi.encodePacked(name)));
        string memory symbol = string.concat(
            "9#",
            Strings.toString(uint256(uint64(id)))
        );
        __ERC20_init(newName, symbol);
        __Ownable_init(admin);
        __ERC20Permit_init(newName);
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
