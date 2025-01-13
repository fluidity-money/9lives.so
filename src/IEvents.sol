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

    event ClaimedDAOFunds(address indexed recipient, uint256 indexed amount);

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

    event DeadlineExtension(
        uint64 indexed timeBefore,
        uint64 indexed timeAfter
    );

    /* INFRASTRUCTURE MARKET */

    event InfraMarketEnabled(bool indexed status);

    event MarketCreated2(
        address indexed incentiveSender,
        address indexed tradingAddr,
        bytes32 indexed desc,
        uint64 launchTs,
        uint64 callDeadline
    );

    event CallMade(
        address indexed tradingAddr,
        bytes8 indexed winner,
        address indexed incentiveRecipient
    );

    event InfraMarketClosed(
        address indexed incentiveRecipient,
        address indexed tradingAddr,
        bytes8 indexed winner
    );

    event DAOMoneyDistributed(
        uint256 indexed amount,
        address indexed recipient
    );

    event Committed(
        address indexed trading,
        address indexed predictor,
        bytes32 indexed commitment
    );

    event CommitmentRevealed(
        address indexed trading,
        address indexed revealer,
        bytes8 indexed outcome,
        address caller,
        uint256 bal
    );

     /// @notice CampaignEscaped, because a campaign is in an
     /// indeterminate state! The DAO may be needed to step in.
    event CampaignEscaped(address indexed tradingAddr);

    /* LOCKUP CONTRACT */

    event LockupEnabled(bool indexed status);

    event LockedUp(
        uint256 indexed amount,
        address indexed recipient
    );

    event Withdrew(
        uint256 indexed amount,
        address indexed recipient
    );

    event Slashed(
        address indexed victim,
        address indexed recipient,
        uint256 indexed slashedAmount
    );

    event Frozen(
        address indexed victim,
        uint64 indexed until
    );

    /* ON-CHAIN SARP SIGNALLER */

    /// @notice Outstanding ticket requested by a user for SARP to resolve a market.
    event Requested(
        address indexed trading,
        uint256 indexed ticket
    );

    /// @notice A request from a submitter was appropriate and resulted in a
    /// non-indeterminate state. Refund the investor.
    event Concluded(uint256 indexed ticket);
}
