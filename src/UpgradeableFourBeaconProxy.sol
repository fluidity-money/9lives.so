// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

// NOTE: THIS IS COMPILED OUT OF BAND FROM THIS REPO, WITH AN
// OPTIMISATION LEVEL OF 2.

interface IBeacon {
    function mintAddr(bool isDpm) external view returns (address);
    function quotesAddr(bool isDpm) external view returns (address);
    function priceAddr(bool isDpm) external view returns (address);
    function extrasAddr(bool isDpm) external view returns (address);
}

contract UpgradeableFourBeaconProxy {
    IBeacon immutable BEACON;
    bool immutable IS_DPM;

    constructor(IBeacon _b, bool _d) {
        BEACON = _b;
        IS_DPM = _d;
    }

    function directDelegate(address to) internal {
        assembly {
            // Copy msg.data. We take full control of memory in this inline assembly
            // block because it will not return to Solidity code. We overwrite the
            // Solidity scratch pad at memory position 0.
            calldatacopy(0, 0, calldatasize())

            // Call the implementation.
            // out and outsize are 0 because we don't know the size yet.
            let result := delegatecall(gas(), to, 0, calldatasize(), 0, 0)

            // Copy the returned data.
            returndatacopy(0, 0, returndatasize())

            switch result
            // delegatecall returns 0 on error.
            case 0 {
                revert(0, returndatasize())
            }
            default {
                return(0, returndatasize())
            }
        }
    }

    fallback() external {
        if (uint8(msg.data[2]) == 1) directDelegate(BEACON.mintAddr(IS_DPM));
        else if (uint8(msg.data[2]) == 2) directDelegate(BEACON.quotesAddr(IS_DPM));
        else if (uint8(msg.data[2]) == 3) directDelegate(BEACON.priceAddr(IS_DPM));
        else directDelegate(BEACON.extrasAddr(IS_DPM));
    }
}
