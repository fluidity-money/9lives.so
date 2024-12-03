// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "../src/INineLivesFactory.sol";

import "./MockTrading.sol";

contract MockFactory is INineLivesFactory {
    address immutable ADDR_FUSDC;
    address immutable ADDR_SHARE;

    constructor(address _fusdc, address _share) {
        ADDR_FUSDC = _fusdc;
        ADDR_SHARE = _share;
    }

    function ctor(
        address /* shareImpl */,
        address /* tradingDPMExtrasImpl */,
        address /* tradingDPMMintImpl */,
        address /* tradingAMMExtrasImpl */,
        address /* tradingAMMMintImpl */,
        address /* infraMarketOracle */
    ) external {}

    function newTrading09393DA8(
        FactoryOutcome[] memory _outcomes,
        address _oracle,
        uint64 _timeStart,
        uint64 _timeEnding,
        bytes32 /* _documentation */,
        address _feeRecipient
    ) external returns (address) {
        MockTrading t = new MockTrading(ADDR_FUSDC, ADDR_SHARE);
        bytes8[] memory outcomes = new bytes8[](_outcomes.length);
        for (uint i = 0; i < _outcomes.length; ++i) {
            outcomes[i] = _outcomes[i].identifier;
        }
        t.ctor(outcomes, _oracle,_timeStart, _timeEnding, _feeRecipient, address(0));
        return address(t);
    }

    function getOwner(address) external pure returns (address) {
        return address(2);
    }

    function getBackend(address) external pure returns (uint8) {
        return 1;
    }

    function getTradingAddr(bytes32 id) external pure returns (address) {
        return address(uint160(uint256(keccak256(abi.encodePacked(id)))));
    }

    function ammTradingHash() external pure returns (bytes32) {
        return keccak256(abi.encodePacked(address(4)));
    }

    function dpmTradingHash() external pure returns (bytes32) {
        return keccak256(abi.encodePacked(address(5)));
    }

    function shareImpl() external pure returns (address) {
        return address(4);
    }

    function erc20Hash() external pure returns (bytes32) {
        return 0x1343ea59060a485e977f5a1e0f03a141751673bb0ef6554d0738326a91838787;
    }
}
