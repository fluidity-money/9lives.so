// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IEvents {
    /* LOCKUP CONTRACT */

    event LockupTokenProxyDeployed(address indexed token);

    /* FACTORY CONTRACT */

    event NewTrading2(
        bytes32 indexed identifier,
        address indexed addr,
        address indexed oracle,
        uint8 backend
    );

    event OutcomeCreated(
        bytes32 indexed tradingIdentifier,
        bytes32 indexed erc20Identifier,
        address indexed erc20Addr
    );

    /* TRADING CONTRACTS */

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

    /* INFRASTRUCTURE MARKET */

    event MarketCreated(
        address indexed incentiveSender,
        address indexed tradingAddr
    );

    event UserPredicted(
        address indexed trading,
        address indexed predictor,
        uint256 indexed tokenAmount,
        uint256 powerAmount,
        bytes8 outcome
    );

    event InfraMarketClosed(
        address indexed incentiveRecipient,
        address indexed tradingAddr,
        bytes8 indexed winner
    );

    event InfraMarketDecided(
        address indexed tradingAddr,
        bytes8 indexed winner
    );
}
