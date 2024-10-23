// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "../src/INineLivesFactory.sol";

contract MockFactory is INineLivesFactory {
    function ctor(address /* oracle */) external {}

    function newTradingC11AAA3B(Outcome[] memory) external pure returns (address) {
        return address(1);
    }

    function getOwner(address) external pure returns (address) {
        return address(2);
    }

    function tradingHash() external pure returns (bytes32) {
        return keccak256(abi.encodePacked(address(3)));
    }

    function erc20Impl() external pure returns (address) {
        return address(4);
    }

    function erc20Hash() external pure returns (bytes32) {
        return 0x1343ea59060a485e977f5a1e0f03a141751673bb0ef6554d0738326a91838787;
    }
}
