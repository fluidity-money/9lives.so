// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

contract MockLongtail {
    uint counter;

    function createPoolD650E2D0(address,uint256,uint32,uint8,uint128) external pure {}
    function enablePool579DA658(address,bool) external pure {}

    function quote72E2ADE7(address, bool, int256, uint256) external {
        counter++;
        bytes memory revertdata = hex"08c379a0000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000093433303230313832320000000000000000000000000000000000000000000000";
        assembly {
            revert(add(revertdata, 32), mload(revertdata))
        }
    }
}
