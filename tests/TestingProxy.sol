// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

// TestingProxy is a useful contract for time-related testing, where it's
// needed to distort the internal perception of time in some contracts by
// editing time-related slots. This is only useful for e2e testing with the
// infra market currently.

contract TestingProxy {
    address immutable DEPLOYMENT;
    address immutable TESTING;

    constructor(address _d, address _t) {
        DEPLOYMENT = _d;
        TESTING = _t;
    }

    function addTime(address /* tradingAddr */, uint256 /* secs */) external {
        (bool success,) = TESTING.delegatecall(msg.data);
        require(success);
    }

    function subTime(address /* tradingAddr */, uint256 /* secs */) external {
        (bool success,) = TESTING.delegatecall(msg.data);
        require(success);
    }

    fallback() external {
        (bool success, bytes memory data) = DEPLOYMENT.delegatecall(msg.data);
        if (data.length > 0 && !success) {
            assembly {
                revert(add(data, 0x20), mload(data))
            }
        } else {
            require(success);
            if (data.length > 0) {
                assembly {
                    return(add(data, 0x20), mload(data))
                }
            }
        }
    }
}
