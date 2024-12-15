// SPDX-Identifier: MIT
pragma solidity 0.8.20;

interface IInfraMarket {
    function register(
        address trading,
        address incentiveSender,
        bytes32 desc,
        uint64 launchTs,
        bytes8 defaultWinner
    ) external returns (uint256);

    function predict(address trading, bytes8 winner, uint256 amount) external;
    function winner(address trading) external returns (bytes8 winnerId);

    function call(
        address trading,
        bytes8 winner,
        address incentiveRecipient
    ) external;

    function close(
        address trading,
        address feeRecipient
    ) external;

    function whinge(
        address trading,
        bytes8 preferredOutcome,
        address bondRecipient
    ) external;

    function sweep(
        address trading,
        address victim,
        bytes8[] calldata outcomes,
        address onBehalfOfAddr,
        address feeRecipientAddr
    ) external returns (uint256 yieldForCaller);
}
