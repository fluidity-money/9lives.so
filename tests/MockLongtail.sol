// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

contract MockLongtail {
    function createPoolD650E2D0(address,uint256,uint32,uint8,uint128) external pure {}
    function enablePool579DA658(address,bool) external pure {}

    function quote72E2ADE7(address, bool, int256, uint256) external pure {
        revert("1000");
    }
}
