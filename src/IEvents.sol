// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

interface IEvents {
    event NewTrading(
        bytes8 indexed identifier,
        address indexed addr,
        address indexed oracle
    );

    event OutcomeCreated(
        bytes8 indexed tradingIdentifier,
        bytes8 indexed erc20Identifier,
        address indexed erc20Addr
    );

    event OutcomeDecided(
        bytes8 indexed identifier,
        address indexed oracle
    );

    event SharesMinted(
        bytes8 indexed identifier,
        uint256 indexed shareAmount,
        address indexed spender,
        address recipient,
        uint256 fusdcSpent
    );

    event PayoffActivated(
        bytes8 indexed identifier,
        uint256 indexed sharesSpent,
        address indexed spender,
        address recipient,
        uint256 fusdcReceived
    );
}
