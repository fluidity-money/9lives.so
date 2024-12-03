// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface INineLivesTrading {
    /**
     * @notice ctor to set the values for this contract.
     * @param outcomes to use to use as betting outcomes in this contract.
     * @param oracle to use as the resolver for this contract.
     * @param timeStart to begin this contract by.
     * @param timeEnding to end this contract by.
     * @param feeRecipient to send fees earned from trading.
     */
    function ctor(
        bytes8[] memory outcomes,
        address oracle,
        uint256 timeStart,
        uint256 timeEnding,
        address feeRecipient,
        address shareImpl
    ) external;

    /**
     * @notice Mint some shares in exchange for fUSDC.
     * @param outcome to bet on.
     * @param value to spend of fUSDC.
     * @param recipient of the funds spent.
     */
    function mint0D365EC6(
        bytes8 outcome,
        uint256 value,
        address recipient
    ) external returns (uint256);

    /**
     * @notice Quote function for testing the amount that could be minted.
     * @param outcome to test for
     * @param value to test spending for
     */
    function quoteC0E17FC7(
        bytes8 outcome,
        uint256 value
    ) external returns (uint256);

    /**
     * @notice Get the price of an outcome in fUSDC.
     * @param outcome to test for
     */
    function priceA827ED27(bytes8 outcome) external returns (uint256);

    /**
     * @notice Shutdown this contract by disabling associated pools. Compensates callers
     * of this function by distributing them a small amount of token for doing so.
     * This can only be called when the contract has exceeded its deadline.
     */
    function shutdown() external;

    /**
     * @notice Decide an outcome. Only callable by the oracle!
     * @param outcome to set as the winner.
     */
    function decide(bytes8 outcome) external;

    /**
     * @notice Collect the payoff if holding winning shares!
     * @param outcomeId to collect the payoff for.
     * @param amount of share to use for receiving the payoff.
     * @param recipient to send the winnings to.
     */
    function payoff91FA8C2E(
        bytes8 outcomeId,
        uint256 amount,
        address recipient
    ) external returns (uint256);

    /**
     * @notice Details that're available for this outcome.
     * @param outcomeId to get the details for
     */
    function details(bytes8 outcomeId) external view returns (
        uint256 shares,
        uint256 invested,
        uint256 globalInvested,
        bytes8 winner
    );

    /// @notice is this trading contract running the DPM?
    function isDpm() external view returns (bool);

    /**
     * @notice Invested amount of fusdc in the betting pool.
     */
    function invested() external view returns (uint256);

    /**
     * @notice get a share address using the identifier given instead of an online check.
     */
    function shareAddr(bytes8 outcomeId) external view returns (address);
}
