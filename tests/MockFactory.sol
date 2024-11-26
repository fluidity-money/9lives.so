// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "../src/INineLivesFactory.sol";

import "./MockTrading.sol";

contract MockFactory is INineLivesFactory {
    address immutable ADDR_FUSDC;

    constructor(address _fusdc) {
        ADDR_FUSDC = _fusdc;
    }

    function ctor(address /* oracle */) external {}

    function newTradingC11AAA3B(
        Outcome[] memory _outcomes,
        address _oracle,
        uint256 _timeStart,
        uint256 _timeEnding,
        bytes32 _documentation,
        address _feeRecipient
    ) external returns (address) {
        MockTrading t = new MockTrading(ADDR_FUSDC);
        t.ctor(_outcomes, _oracle, _timeStart, _timeEnding, _documentation, _feeRecipient);
        return address(t);
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
