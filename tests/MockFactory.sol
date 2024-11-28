// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "../src/INineLivesFactory.sol";

import "./MockTrading.sol";

contract MockFactory is INineLivesFactory {
    address immutable ADDR_FUSDC;

    constructor(address _fusdc) {
        ADDR_FUSDC = _fusdc;
    }

    function ctor(
        address /* shareImpl */,
        address /* tradingExtrasImpl */,
        address /* tradingMintImpl */,
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
        MockTrading t = new MockTrading(ADDR_FUSDC);
        TradingOutcome[] memory outcomes = new TradingOutcome[](_outcomes.length);
        for (uint i = 0; i < _outcomes.length; ++i) {
            outcomes[i].identifier = _outcomes[i].identifier;
            outcomes[i].amount = _outcomes[i].amount;
        }
        t.ctor(outcomes, _oracle,_timeStart, _timeEnding, _feeRecipient);
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
