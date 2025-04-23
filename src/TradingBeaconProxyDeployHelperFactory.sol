// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import "./TradingBeacon.sol";
import "./TradingBeaconProxy.sol";

import "./INineLivesTrading.sol";
import "./ITradingBeacon.sol";

// TradingBeaconProxyDeployHelperFactory deploys a single AMM trading
// contract with upgradeablility features in the proxy. Useful for
// limited run releases. Uses the implementation of the proxy code that we use
// in the huff format to build the proxy here.
contract TradingBeaconProxyDeployHelperFactory {
    ITradingBeacon immutable BEACON;
    TradingBeaconProxy immutable IMPL;

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
    }

    constructor(
        address _admin,
        address _mint,
        address _quotes,
        address _price,
        address _extras
    ) {
        BEACON = new TradingBeacon(_admin, _mint, _quotes, _price, _extras);
        // When someone asks for a new deployment of this, we simply copy the
        // deployed code to a new location.
        IMPL = new TradingBeaconProxy(BEACON);
    }

    function copyAddr(address _impl) public returns (address) {
        // Solidity array concatenation formula that we use in the Rust code.
        // Since the code will be amended to include the correct address during
        // the deployment.
        address ptr;
        assembly {
            let code := mload(0x40)
            mstore(code, 0x602d5f8160095f39f35f5f365f5f37365f73)
            mstore(add(code,0x12), shl(0x60, _impl))
            mstore(add(code,0x26), 0x5af43d5f5f3e6029573d5ffd5b3d5ff3)
            ptr :=  create(0, code, 0x36)
        }
        require(ptr != address(0), "copy fail");
        return ptr;
    }

    function create(CreateArgs calldata _a) external {
    }
}
