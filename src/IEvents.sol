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
}
