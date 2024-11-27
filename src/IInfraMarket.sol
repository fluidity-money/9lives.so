// SPDX-Identifier: MIT
pragma solidity 0.8.18;

interface IInfraMarket {
    function register(
        address trading,
        address incentiveSender,
        bytes32 desc,
        uint64 launchTs
    ) external;

    function predict(address trading, bytes8 winner, uint256 amount) external;
    function winner() external view returns (bytes8 winnerId);

    function marketVested(address trading, bytes8 outcome) external view returns (uint256);

    function sweep(
        address trading,
        address victim,
        bytes8[] calldata outcomes,
        address recipient
    ) external returns (uint256 yieldForCaller);
}
