// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import {Script, console} from "forge-std/Script.sol";

import "../src/FactoryProxy.sol";

interface IFactory {
    function ctor(address) external;
}

contract DeployFactoryTransparentProxy is Script {
    function run() public {
        vm.broadcast();
        address impl1 = vm.envAddress("SPN_FACTORY_1_IMPL");
        address impl2 = vm.envAddress("SPN_FACTORY_2_IMPL");
        address admin = vm.envAddress("SPN_PROXY_ADMIN_ADDR");
        address oracle = vm.envAddress("SPN_ORACLE_ADDR");
        address proxy = address(new FactoryProxy(admin, impl1, impl2,
            abi.encodeWithSelector(IFactory.ctor.selector, oracle)
        ));
        console.log(proxy);
    }
}
