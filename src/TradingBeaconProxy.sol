// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import { ITradingBeacon } from "./ITradingBeacon.sol";

bytes32 constant SLOT_BEACON = bytes32(uint256(keccak256('eip1967.proxy.beacon')) - 1);

library StorageSlot {
    struct AddressSlot {
        address value;
    }

    function getAddressSlot(bytes32 slot) internal pure returns (AddressSlot storage r) {
        assembly {
            r.slot := slot
        }
    }
}

/**
 * @notice This is only useful for a very limited context, which is a limited run
 *         "blessed" deployment that's inaccessible using the normal path of
 *         addressing trading deployments. This could be useful for experimental
 *         releases that need upgradeability. The beacon also has a custom feature to
 *         disable the running, useful for an experimental release.
 */
contract TradingBeaconProxy {
    ITradingBeacon immutable BEACON;

    constructor(ITradingBeacon _impl) {
        BEACON = _impl;
    }

    /**
     * @notice indicateProxy is an optional function to indicate the beacon address.
     * @dev Let's hope we don't have a signature collision here.
     */
    function indicateProxy() external {
        StorageSlot.getAddressSlot(SLOT_BEACON).value = address(BEACON);
    }

    fallback() external {
        // Set the slot for EIP712 compatibility. Always do this, even if it's a
        // waste, so we don't depend on the platform setup context.
        bool rc;
        bytes memory rd;
        uint8 sel = uint8(msg.data[2]);
        if (sel == 1) (rc, rd) = BEACON.mint().delegatecall(msg.data);
        else if (sel == 2) (rc, rd) = BEACON.quotes().delegatecall(msg.data);
        else if (sel == 3) (rc, rd) = BEACON.price().delegatecall(msg.data);
        else (rc, rd) = BEACON.extras().delegatecall(msg.data);
        if (rd.length > 0 && !rc) {
            /// @solidity memory-safe-assembly
            assembly {
                revert(add(rd, 0x20), mload(rd))
            }
        } else {
            require(rc);
            if (rd.length > 0) {
                /// @solidity memory-safe-assembly
                assembly {
                    return(add(rd, 0x20), mload(rd))
                }
            }
        }
    }
}
