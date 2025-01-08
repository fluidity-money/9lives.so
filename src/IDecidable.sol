// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IDecidable {
    /**
     * @notice Decide an outcome. Only callable by the oracle!
     * @param outcome to set as the winner.
     */
    function decide(bytes8 outcome) external;
}
