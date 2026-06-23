// SPDX-Identifier: MIT
pragma solidity 0.8.30;

import {
    TransparentUpgradeableProxy} from "@openzeppelin/contracts/proxy/transparent/TransparentUpgradeableProxy.sol";

import {NineLivesFactory} from "./NineLivesFactory.sol";

import {INineLivesFactory} from "./INineLivesFactory.sol";

interface Factory {
    function ctor(address operator) external;
}

struct DeployArgs {
    address admin;
    address emergencyCouncil;
    address shareImpl;
    address beaconAddr;
    address dppmHourCreatorAddr;
    address dppm15MinCreatorAddr;
    address dppm5MinCreatorAddr;
    address oracleAddr;
    address vaultAddr;
    address shareImplAddr;
}

contract DeployHelper {
    event FactoryDeployed(address indexed addr);

    constructor(DeployArgs memory _a) {
        INineLivesFactory factory = INineLivesFactory(address(new TransparentUpgradeableProxy(
            address(new NineLivesFactory(
                _a.beaconAddr,
                _a.dppmHourCreatorAddr,
                _a.dppm15MinCreatorAddr,
                _a.dppm5MinCreatorAddr,
                _a.oracleAddr,
                _a.vaultAddr,
                _a.shareImplAddr
            )),
            _a.admin,
            abi.encodeWithSelector(Factory.ctor.selector, _a.admin)
        )));
        emit FactoryDeployed(address(factory));
    }
}
