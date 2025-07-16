// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import { IInfraMarket, InfraMarketState } from "../src/IInfraMarket.sol";

contract MockCallInfraMarket is IInfraMarket {
    mapping(address => bytes8) public winner;
    mapping(address => InfraMarketState) states;
    mapping(address => uint64) public startTs;
    mapping(address => uint64) public endTs;

    function ctor(
        address /* operator */,
        address /* emergencyCouncil */,
        address /* lockup */,
        address /* lockedArbToken */,
        address /* factory */
    ) external {}

    function register(
        address tradingAddr,
        bytes32 /* desc */,
        uint64 /* launchTs */,
        uint64 /* callDeadlineTs */
    ) external returns (uint256) {
        states[tradingAddr] = InfraMarketState.Callable;
        return 0;
    }

    function call(
        address tradingAddr,
        bytes8 /* winner */,
        address /* incentiveRecipient */
    ) external returns (uint256) {
        states[tradingAddr] = InfraMarketState.Closable;
        return 0;
    }

    function whinge(
        address tradingAddr,
        bytes8 /* preferredOutcome */,
        address /* bondRecipient */
    ) external returns (uint256) {
        states[tradingAddr] = InfraMarketState.Whinging;
        return 0;
    }

    function predict(address tradingAddr, bytes32 /* commit */) external {
        states[tradingAddr] = InfraMarketState.Predicting;
    }

    function callerPreferredOutcome(address) external pure returns (bytes8) {
        return bytes8(0);
    }

    function whingerPreferredWinner(address) external pure returns (bytes8) {
        return bytes8(0);
    }

    function curOutcomeVestedArb(
        address /* tradingAddr */,
        bytes8 /* outcome */
    ) external pure returns (uint256) {
        return 0;
    }

    function epochNumber(address /* tradingAddr */) external pure returns (uint256) {
        return 0;
    }

    function reveal(
        address /* tradingAddr */,
        address /* committerAddr */,
        bytes8 /* outcome */,
        uint256 /* seed */
    ) external {}

    function sweep(
        address /* tradingAddr */,
        uint256 /* epochNo */,
        address /* victim */,
        address /* feeRecipientAddr */
    ) external pure returns (uint256) {
        return 0;
    }

    function capture(
        address /* tradingAddr */,
        uint256 /* epochNo */,
        address /* feeRecipient */
    ) external pure returns (uint256) {
        return 0;
    }

    function close(address tradingAddr, address /* feeRecipient */) external {
        states[tradingAddr] = InfraMarketState.Closed;
    }

    function escape(address tradingAddr) external {}

    function setWinner(address tradingAddr, bytes8 outcome) external {
        winner[tradingAddr] = outcome;
    }

    function status(address tradingAddr) external view returns (InfraMarketState, uint64) {
        return (states[tradingAddr], 0);
    }

    function setStartTs(address tradingAddr, uint64 t) external {
        startTs[tradingAddr] = t;
    }

    function setEndTs(address tradingAddr, uint64 t) external {
        endTs[tradingAddr] = t;
    }

    function declare(
        address /* tradingAddr */,
        bytes8[] calldata /* outcomes */,
        address /* feeRecipient */
    ) external pure returns (uint256) {
        return 0;
    }

    function enableContract(bool /* status */) external pure returns (bool) {
        return true;
    }
}
