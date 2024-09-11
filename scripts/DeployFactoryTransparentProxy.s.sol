// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import {Script, console} from "forge-std/Script.sol";

import "@openzeppelin/contracts/token/ERC20/ERC20Upgradeable.sol";

contract DeployFactoryTransparentProxy is Script {
    function run() public {
        address deployer = vm.envAddress("SPN_ADMIN_ADDR");
        address implementation = vm.envAddress("SPN_IMPL_ADDR");
    }
}
