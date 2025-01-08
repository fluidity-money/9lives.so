// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IDecidable {
    /**
     * @notice Decide an outcome. Only callable by the oracle!
     * @param outcome to set as the winner.
     */
    function decide(bytes8 outcome) external;

    /**
     * @notice Escape an indeterminate/inconclusive campaign, where an associated contract
     *         needs to do something.
     */
    function escape() external;
}

