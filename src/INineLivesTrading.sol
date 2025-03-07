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
     * @param shouldBufferTime to extend time by 3 hours for every purchase within a 3
     * hour window. If this is enabled, the contract will enforce purchases to exceed
     * $10 if they are taking place within 3 hours of the contract's scheduled end time.
     * @param feeCreator to take as the default fee from every mint for the creator of this contract.
     * @param feeMinter to take as the fee that we give to minters.
     * @param feeLp to take as a fee for the market makers who used the add/remove features.
     */
    function ctor(
        bytes8[] memory outcomes,
        address oracle,
        uint64 timeStart,
        uint64 timeEnding,
        address feeRecipient,
        address shareImpl,
        bool shouldBufferTime,
        uint64 feeCreator,
        uint64 feeMinter,
        uint64 feeLp
    ) external;

    /**
     * @notice oracle that's in use in this trading contract.
     */
    function oracle() external view returns (address);

    /**
     * @notice Mint some shares in exchange for fUSDC. Optionally branches to permit or a
     * classic approval based on the deadline argument (if set to 0, assumes approval)
     */
    function mintPermitE90275AB(
        bytes8 outcome,
        uint256 value,
        address recipient,
        uint256 deadline,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) external returns (uint256);

    /**
     * @notice Burn some shares by inverting the AMM function using the fUSDC amount.
     */
    function burnPermit7045A604(
        bytes8 outcome,
        uint256 fusdcAmount,
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
    function shutdown() external returns (uint256);

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
     * @notice Return the amount that would be earned if payoff was used under normal
     * circumstances.
     * @param outcomeId to use as the outcome to simulate payoff for.
     * @param amount to simulate with.
     */
    function payoffQuote1FA6DC28(
        bytes8 outcomeId,
        uint256 amount
    ) external view returns (uint256);

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

    function escape() external;

    /// @notice is this trading contract running the DPM?
    function isDpm() external view returns (bool);

    /// @notice global shares minted.
    function globalShares() external view returns (uint256);

    /**
     * @notice Invested amount of fusdc in the betting pool.
     */
    function invested() external view returns (uint256);

    function timeEnding() external view returns (uint64);

    function timeStart() external view returns (uint64);

    /**
     * @notice get a share address using the identifier given instead of an online check.
     */
    function shareAddr(bytes8 outcomeId) external view returns (address);
}
