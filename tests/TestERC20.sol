// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import { ERC20 } from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import { ERC20Permit } from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";

contract TestERC20 is ERC20, ERC20Permit {
    constructor() ERC20("TestERC20", "TestERC20") ERC20Permit("TestERC20") {
        _mint(msg.sender, type(uint256).max);
    }
}
