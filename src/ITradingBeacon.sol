// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

interface ITradingBeacon {
    function mint() external view returns (address);
    function quotes() external view returns (address);
    function price() external view returns (address);
    function extras() external view returns (address);
}
