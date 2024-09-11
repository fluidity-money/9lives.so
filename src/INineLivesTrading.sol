// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

interface INineLivesTrading {
    /**
     * @notice mint some shares in exchange for fUSDC.
     * @param outcome to bet on.
     * @param value to spend of fUSDC.
     * @param recipient of the funds spent.
     */
    function mint(bytes8 outcome, uint256 value, address recipient) external returns (uint256);

    /**
     * @notice mint some shares in exchange for fUSDC.
     * @param outcome to bet on.
     * @param value to spend of fUSDC.
     * @param deadline to spend by.
     * @param recipient of the funds spent.
     * @param v to use for the permit signature
     * @param r to use for permit.
     * @param s to use for permit.
     */
    function mintPermit(
        bytes8 outcome,
        uint256 value,
        uint256 deadline,
        address recipient,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) external returns (uint256);

    /**
     * @notice decide an outcome. Only callable by the oracle!
     * @param outcome to set as the winner.
     */
    function decide(bytes8 outcome) external;

    /**
     * @notice collect the payoff if holding winning shares!
     * @param outcomeId to collect the payoff for.
     * @param recipient to send the winnings to.
     */
    function payoff(bytes8 outcomeId, address recipient) external returns (uint256);

    /**
     * @notice details that're available for this outcome.
     * @param outcomeId to get the details for
     */
    function details(bytes8 outcomeId) external view returns (
        uint256 shares,
        uint256 invested,
        bool isWinner
    );

    /**
     * @notice invested amount of fusdc in the betting pool
     */
    function invested() external view returns (uint256);
}