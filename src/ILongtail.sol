// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface ILongtail {
    function createPool653F395E(address pool, uint256 price, uint32 fee) external;
    function enablePool579DA658(address pool, bool enabled) external;

    function quote72E2ADE7(
        address pool,
        bool zeroForOne,
        int256 amount,
        uint256 priceLimitX96
     ) external;
}
