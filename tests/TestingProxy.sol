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

    // It's difficult to do testing properly with this format, so the
    // approach we're going to use is having this format so it's possible to
    // do end to end testing that things are functioning. This code should
    // not be relied upon for serious testing!
    function addTime(uint64 /* secs */) external {
        (bool success, bytes memory rd) = TESTING.delegatecall(msg.data);
        if (!success) {
            assembly {
                revert(add(rd, 32), mload(rd))
            }
        }
    }

    function subTime(uint64 /* secs */) external {
        (bool success,) = TESTING.delegatecall(msg.data);
        require(success);
    }

    function setLockedArbTokenAddr(address /* addr */) external {
        (bool success,) = TESTING.delegatecall(msg.data);
        require(success);
    }

    event Something();

    // Helper to send an empty transaction without actually making an
    // empty transaction.
    function wasteOfTime() external {
        emit Something();
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
