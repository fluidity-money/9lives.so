// SPDX-Identifier: MIT
pragma solidity 0.8.20;

import {UpgradeableTwoProxy} from "./UpgradeableTwoProxy.sol";

import {
    TransparentUpgradeableProxy} from "@openzeppelin/contracts/proxy/transparent/TransparentUpgradeableProxy.sol";

import {INineLivesFactory} from "./INineLivesFactory.sol";
import {ILockup} from "./ILockup.sol";

interface InfraMarket {
    function ctor(
        address admin,
        address emergency,
        ILockup lockup,
        address lockedArbToken,
        INineLivesFactory factoryAddr
    ) external;
}

interface Lockup {
    function ctor(address tokenImpl, address infraMarket, address operator) external;
}

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
        address infraMarketOracle,
        address operator
    ) external;
}

struct DeployArgs {
    address admin;
    address emergencyCouncil;
    address lockupTokenImpl;
    address shareImpl;
    address factory1Impl;
    address factory2Impl;
    address infraMarketImpl;
    address lockupImpl;
    address tradingDpmExtrasImpl;
    address tradingDpmMintImpl;
    address tradingDpmQuotesImpl;
    address tradingDpmPriceImpl;
    address tradingAmmExtrasImpl;
    address tradingAmmMintImpl;
    address tradingAmmQuotesImpl;
    address tradingAmmPriceImpl;
    address beautyContestImpl;
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
        // Here we deploy the infra market proxy, but we don't do any setup on it (yet).
        InfraMarket infraMarket = InfraMarket(address(new TransparentUpgradeableProxy(
            _a.infraMarketImpl,
            _a.admin,
            ""
        )));
        emit InfraMarketDeployed(address(infraMarket));
        // Then, we deploy the lockup proxy.
        ILockup lockup = ILockup(address(new TransparentUpgradeableProxy(
            _a.lockupImpl,
            _a.admin,
            abi.encodeWithSelector(
                Lockup.ctor.selector,
                _a.lockupTokenImpl,
                address(infraMarket),
                _a.admin
            )
        )));
        emit LockupDeployed(address(lockup));
        emit BeautyContestDeployed(address(new TransparentUpgradeableProxy(
            _a.beautyContestImpl,
            _a.admin,
            ""
        )));
        // Then, we do some setup on the infra market proxy.
        infraMarket.ctor(
            _a.admin,
            _a.emergencyCouncil,
            lockup,
            lockup.tokenAddr(),
            INineLivesFactory(address(factory))
        );
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
            address(infraMarket),
            _a.admin
        );
    }
}
