// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import {
    INineLivesFactory,
    FactoryOutcome } from "../src/INineLivesFactory.sol";

import { CtorArgs } from "../src/INineLivesTrading.sol";

import { MockTrading } from "./MockTrading.sol";

contract MockFactory is INineLivesFactory {
    address immutable ADDR_FUSDC;

    constructor(address _fusdc) {
        ADDR_FUSDC = _fusdc;
    }

    function ctor(
        address /* shareImpl */,
        address /* tradingDPMExtrasImpl */,
        address /* tradingDPMMintImpl */,
        address /* tradingAMMExtrasImpl */,
        address /* tradingAMMMintImpl */,
        address /* infraMarketOracle */,
        address /* operator */
    ) external {}

    function newTrading37E9F4BE(
        FactoryOutcome[] memory _outcomes,
        address _oracle,
        uint64 _timeStart,
        uint64 _timeEnding,
        bytes32 /* _documentation */,
        address _feeRecipient,
        uint64 /* feeCreator */,
        uint64 /* feeLp */,
        uint64 /* feeMinter */,
        uint64 /* feeReferrer */,
        bool /* backendIsDpm */,
        uint256 /* seedLiq */
    ) external returns (address) {
        MockTrading t = new MockTrading(ADDR_FUSDC, address(0));
        bytes8[] memory outcomes = new bytes8[](_outcomes.length);
        for (uint i = 0; i < _outcomes.length; ++i) {
            outcomes[i] = _outcomes[i].identifier;
        }
        t.ctor(CtorArgs({
            outcomes: outcomes,
            oracle: _oracle,
            timeStart: _timeStart,
            timeEnding: _timeEnding,
            feeRecipient: _feeRecipient,
            shouldBufferTime: false,
            feeCreator: 0,
            feeMinter: 0,
            feeLp: 0,
            feeReferrer: 0,
            startingLiq: 2e6
        }));
        return address(t);
    }

    function isModerationFeeEnabled() external pure returns (bool) {
        return false;
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

    function dppmTradingHash() external pure returns (bytes32) {
        return keccak256(abi.encodePacked(address(5)));
    }

    function shareImpl() external pure returns (address) {
        return address(4);
    }

    function erc20Hash() external pure returns (bytes32) {
        return 0x1343ea59060a485e977f5a1e0f03a141751673bb0ef6554d0738326a91838787;
    }
}
