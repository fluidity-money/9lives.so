// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

interface INineLivesTrading {
    /**
     * @notice Mint some shares in exchange for fUSDC.
     * @param outcome to bet on.
     * @param value to spend of fUSDC.
     * @param recipient of the funds spent.
     */
    function mint227CF432(bytes8 outcome, uint256 value, address recipient) external returns (uint256);

    /**
     * @notice Quote function for testing the amount that could be minted.
     * @param outcome to test for
     * @param value to test spending for
     * @param recipient of the funds spent (unused)
     */
    function quote101CBE35(bytes8 outcome, uint256 value, address recipient) external returns (uint256);

    /**
     * @notice Mint some shares in exchange for fUSDC.
     * @param outcome to bet on.
     * @param value to spend of fUSDC.
     * @param deadline to spend by.
     * @param recipient of the funds spent.
     * @param v to use for the permit signature
     * @param r to use for permit.
     * @param s to use for permit.
     */
    function mintPermitB8D681AD(
        bytes8 outcome,
        uint256 value,
        uint256 deadline,
        address recipient,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) external returns (uint256);

    /**
     * @notice Decide an outcome. Only callable by the oracle!
     * @param outcome to set as the winner.
     */
    function decide(bytes8 outcome) external;

    /**
     * @notice Collect the payoff if holding winning shares!
     * @param outcomeId to collect the payoff for.
     * @param recipient to send the winnings to.
     */
    function payoff(bytes8 outcomeId, address recipient) external returns (uint256);

    /**
     * @notice Details that're available for this outcome.
     * @param outcomeId to get the details for
     */
    function details(bytes8 outcomeId) external view returns (
        uint256 shares,
        uint256 invested,
        bool isWinner
    );

    /**
     * @notice Invested amount of fusdc in the betting pool.
     */
    function invested() external view returns (uint256);

    /**
     * @notice get a share address using the identifier given instead of an online check.
     */
    function shareAddr(bytes8 outcomeId) external view returns (address);
}
