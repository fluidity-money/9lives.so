// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import "./ExtrasBeacon.sol";

contract ExtrasBeaconProxy {
    ExtrasBeacon immutable BEACON;

    constructor(ExtrasBeacon _b) {
        BEACON = _b;
    }

    fallback() external {
        address impl = BEACON.impl(msg.sig);
        (bool success, bytes memory data) = impl.delegatecall(msg.data);
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
