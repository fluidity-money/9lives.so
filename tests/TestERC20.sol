// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";

contract TestERC20 is ERC20, ERC20Permit {
    constructor() ERC20("TestERC20", "TestERC20") ERC20Permit("TestERC20") {
        _mint(msg.sender, type(uint256).max);
    }
}
