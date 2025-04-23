// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import "./ITradingBeacon.sol";

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

contract TradingBeaconProxy {
    constructor() {
        StorageSlot.getAddressSlot(SLOT_BEACON).value = 0x9999999999999999999999999999999999999999;
    }

    fallback() external {
        bool rc;
        bytes memory rd;
        ITradingBeacon beacon = ITradingBeacon(0x9999999999999999999999999999999999999999);
        uint8 sel = uint8(msg.data[2]);
        if (sel == 0) (rc, rd) = beacon.mint().delegatecall(msg.data);
        else if (sel == 1) (rc, rd) = beacon.quotes().delegatecall(msg.data);
        else if (sel == 2) (rc, rd) = beacon.price().delegatecall(msg.data);
        else (rc, rd) = beacon.extras().delegatecall(msg.data);
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
