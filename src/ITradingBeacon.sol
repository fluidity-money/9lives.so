// SPDX-License-Identifier: MIT
pragma solidity 0.8.30;

interface ITradingBeacon {
    function implementation(bytes4 sel) external view returns (address);
}
