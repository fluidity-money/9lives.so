// SPDX-License-Identifier: MIT
// Compatible with OpenZeppelin Contracts ^5.0.0
pragma solidity ^0.8.30;

import {ERC20Upgradeable} from "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";
import {OwnableUpgradeable} from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import {
    ERC20PermitUpgradeable
} from "@openzeppelin/contracts-upgradeable/token/ERC20/extensions/ERC20PermitUpgradeable.sol";
import {Initializable} from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";

import {IShare} from "./IShare.sol";

contract Share is IShare, Initializable, ERC20Upgradeable, OwnableUpgradeable, ERC20PermitUpgradeable {
    address public admin;

    constructor() {
        _disableInitializers();
    }

    function ctor(string calldata name, address _admin) external initializer {
        admin = _admin;
        string memory newName = string.concat(
            "9lives #",
            /// We do this to protect the user from being distracted by other tokens.
            Strings.toString(uint256(uint8(uint256(keccak256(abi.encodePacked(block.timestamp)))))),
            " ",
            name
        );
        bytes8 id = bytes8(keccak256(abi.encodePacked(name)));
        string memory symbol = string.concat("9#", Strings.toString(uint256(uint64(id))));
        __ERC20_init(newName, symbol);
        __Ownable_init(_admin);
        __ERC20Permit_init(newName);
    }

    function decimals() public pure override returns (uint8) {
        return 6;
    }

    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }

    function burn(address owner, uint256 value) public onlyOwner {
        _burn(owner, value);
    }
}
