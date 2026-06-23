// SPDX-Identifier: MIT
pragma solidity 0.8.30;

import {UpgradeableTwoProxy} from "./UpgradeableTwoProxy.sol";

import {TransparentUpgradeableProxy} from "@openzeppelin/contracts/proxy/transparent/TransparentUpgradeableProxy.sol";

import {INineLivesFactory} from "./INineLivesFactory.sol";

interface Factory {
    function ctor(address operator) external;
}

struct DeployArgs {
    address admin;
    address emergencyCouncil;
    address shareImpl;
    address factory1Impl;
    address factory2Impl;
}

contract DeployHelper {
    event FactoryDeployed(address indexed addr);

    constructor(DeployArgs memory _a) {
        // First, we deploy the factory proxy, but we don't do any setup on it.
        Factory factory = Factory(address(new UpgradeableTwoProxy(_a.admin, _a.factory1Impl, _a.factory2Impl, "")));
        emit FactoryDeployed(address(factory));
        // It's time to set up the factory!
        factory.ctor(_a.admin);
    }
}
