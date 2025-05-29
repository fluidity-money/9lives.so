// SPDX-License-Identifier: MIT
// Compatible with OpenZeppelin Contracts ^5.0.0
pragma solidity 0.8.20;

import {ERC20Upgradeable} from "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";
import {ERC20PermitUpgradeable} from "@openzeppelin/contracts-upgradeable/token/ERC20/extensions/ERC20PermitUpgradeable.sol";
import {Initializable} from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import {OwnableUpgradeable} from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

contract NinelivesCash is Initializable, ERC20Upgradeable, OwnableUpgradeable, ERC20PermitUpgradeable {
    mapping(address => uint256) public debt;

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize(address initialOwner) public initializer {
        __ERC20_init("NinelivesCash", "9CASH");
        __Ownable_init(initialOwner);
        __ERC20Permit_init("NinelivesCash");
    }

    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }
}
