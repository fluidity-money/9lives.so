// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import {Script, console} from "forge-std/Script.sol";

import {
    TransparentUpgradeableProxy
} from "@openzeppelin/contracts/proxy/transparent/TransparentUpgradeableProxy.sol";

contract DeployFactoryTransparentProxy is Script {
    function run() public {
        address impl = vm.envAddress("SPN_IMPL_ADDR");
        address admin = vm.envAddress("SPN_ADMIN_ADDR");
        bytes memory data = vm.envBytes("SPN_DEPLOY_DATA");
        address proxy = address(new TransparentUpgradeableProxy(impl, admin, data));
        console.log(proxy);
    }
}