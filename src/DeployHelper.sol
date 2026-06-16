// SPDX-Identifier: MIT
pragma solidity 0.8.20;

import {UpgradeableTwoProxy} from "./UpgradeableTwoProxy.sol";

import {
    TransparentUpgradeableProxy} from "@openzeppelin/contracts/proxy/transparent/TransparentUpgradeableProxy.sol";

import {INineLivesFactory} from "./INineLivesFactory.sol";

interface Factory {
    function ctor(
        address shareImpl,
        address tradingDpmExtrasImpl,
        address tradingDpmMintImpl,
        address tradingDpmQuotesImpl,
        address tradingDpmPriceImpl,
        address tradingAMMExtrasImpl,
        address tradingAMMMintImpl,
        address tradingAmmQuotesImpl,
        address tradingAmmPriceImpl,
        address operator
    ) external;
}

struct DeployArgs {
    address admin;
    address emergencyCouncil;
    address shareImpl;
    address factory1Impl;
    address factory2Impl;
    address tradingDpmExtrasImpl;
    address tradingDpmMintImpl;
    address tradingDpmQuotesImpl;
    address tradingDpmPriceImpl;
    address tradingAmmExtrasImpl;
    address tradingAmmMintImpl;
    address tradingAmmQuotesImpl;
    address tradingAmmPriceImpl;
}

contract DeployHelper {
    event FactoryDeployed(address indexed addr);
    event InfraMarketDeployed(address indexed addr);
    event LockupDeployed(address indexed addr);
    event BeautyContestDeployed(address indexed addr);

    constructor(DeployArgs memory _a) {
        // First, we deploy the factory proxy, but we don't do any setup on it.
        Factory factory = Factory(address(new UpgradeableTwoProxy(
            _a.admin,
            _a.factory1Impl,
            _a.factory2Impl,
            ""
        )));
        emit FactoryDeployed(address(factory));
        // It's time to set up the factory!
        factory.ctor(
            _a.shareImpl,
            _a.tradingDpmExtrasImpl,
            _a.tradingDpmMintImpl,
            _a.tradingDpmQuotesImpl,
            _a.tradingDpmPriceImpl,
            _a.tradingAmmExtrasImpl,
            _a.tradingAmmMintImpl,
            _a.tradingAmmQuotesImpl,
            _a.tradingAmmPriceImpl,
            _a.admin
        );
    }
}
