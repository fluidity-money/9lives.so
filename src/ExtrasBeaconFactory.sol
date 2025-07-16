// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import { ExtrasBeacon} from "./ExtrasBeacon.sol";
import { ExtrasBeaconProxy } from "./ExtrasBeaconProxy.sol";

contract ExtrasBeaconFactory {
    function deploy(
        address _owner,
        address _default
    ) external returns (address beacon, address proxy) {
        ExtrasBeacon b = new ExtrasBeacon(_owner, _default);
        beacon = address(b);
        proxy = address(new ExtrasBeaconProxy(b));
    }
}
