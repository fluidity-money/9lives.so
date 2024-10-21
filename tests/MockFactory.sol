// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "../src/INineLivesFactory.sol";

contract MockFactory is INineLivesFactory {
    function ctor(address /* oracle */) external {}

    function newTrading03B23698(Outcome[] memory) external pure returns (address) {
        return address(1);
    }

    function getOwner(address) external pure returns (address) {
        return address(2);
    }

    function tradingHash() external pure returns (bytes32) {
        return keccak256(abi.encodePacked(address(3)));
    }
}
