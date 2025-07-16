// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import { TradingBeacon } from "./TradingBeacon.sol";
import { TradingBeaconProxy } from  "./TradingBeaconProxy.sol";

import { INineLivesTrading, CtorArgs } from "./INineLivesTrading.sol";
import { ITradingBeacon } from "./ITradingBeacon.sol";

// TradingBeaconProxyDeployHelperFactory deploys a single AMM trading
// contract with upgradeablility features in the proxy. Useful for
// limited run releases. Uses the implementation of the proxy code that we use
// in the huff format to build the proxy here.
contract TradingBeaconProxyDeployHelperFactory {
    ITradingBeacon immutable public BEACON;
    TradingBeaconProxy immutable IMPL;

    // With the way calldata works, this is the same as just passing the arguments.
    struct CreateArgs {
        bytes8[] outcomes;
        address oracle;
        uint64 timeStart;
        uint64 timeEnding;
        address feeRecipient;
        address shareImpl;
        bool shouldBufferTime;
        uint64 feeCreator;
        uint64 feeMinter;
        uint64 feeLp;
        uint64 feeReferrer;
    }

    event DeploymentCompleted(
        ITradingBeacon indexed beacon,
        TradingBeaconProxy indexed impl
    );

    constructor(
        address _admin,
        address _mint,
        address _quotes,
        address _price,
        address _extras
    ) {
        BEACON = new TradingBeacon(_admin, _mint, _quotes, _price, _extras);
        // When someone asks for a new deployment of this, we simply copy the
        // deployed code to a new location. This is an issue since the proxy code won't
        // include the slot set up, but this could be useful in a less general context
        // where perhaps you don't want to do it properly, maybe for a limited run.
        IMPL = new TradingBeaconProxy(BEACON);
        emit DeploymentCompleted(BEACON, IMPL);
    }

    function clone(address _impl, bytes memory _args)
        public
        returns (address instance)
    {
        // Stolen from Solady https://github.com/Vectorized/solady/blob/4fbee81aaa714f8b5d331e3d2a02ddfb34c26b19/src/utils/LibClone.sol#L425C5-L499C6
        /// @solidity memory-safe-assembly
        assembly {
            let m := mload(0x40)
            let n := mload(_args)
            pop(staticcall(gas(), 4, add(_args, 0x20), n, add(m, 0x43), n))
            mstore(add(m, 0x23), 0x5af43d82803e903d91602b57fd5bf3)
            mstore(add(m, 0x14), _impl)
            mstore(m, add(0xfe61002d3d81600a3d39f3363d3d373d3d3d363d73, shl(136, n)))
            // Do a out-of-gas revert if `n` is greater than `0xffff - 0x2d = 0xffd2`.
            instance := create(0, add(m, add(0x0b, lt(n, 0xffd3))), add(n, 0x37))
            if iszero(instance) {
                mstore(0x00, 0x30116425) // `DeploymentFailed()`.
                revert(0x1c, 0x04)
            }
        }
    }

    function create(CreateArgs calldata _a) external returns (INineLivesTrading) {
        address i = clone(address(IMPL), "");
        TradingBeaconProxy(i).indicateProxy();
        INineLivesTrading n = INineLivesTrading(i);
        n.ctor(CtorArgs({
            outcomes: _a.outcomes,
            oracle: _a.oracle,
            timeStart: _a.timeStart,
            timeEnding: _a.timeEnding,
            feeRecipient: _a.feeRecipient,
            shareImpl: _a.shareImpl,
            shouldBufferTime: _a.shouldBufferTime,
            feeCreator: _a.feeCreator,
            feeMinter: _a.feeMinter,
            feeLp: _a.feeLp,
            feeReferrer: _a.feeReferrer
        }));
        return n;
    }
}
