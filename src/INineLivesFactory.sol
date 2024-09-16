// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

interface INineLivesFactory {
    /**
     * @notice Construct the Factory, configuring all Trading instances to use the oracle
     *         given.
     * @param oracle to set as the oracle for determining the outcome of all Trading
     *        instances.
     */
    function ctor(address oracle) external;

    struct Outcome {
        bytes8 identifier;
        uint256 seed;
    }

    /**
     * @notice set up new trading contract, seeding the initial amounts
     * @param outcomes to set up as the default
     */
    function newTrading(Outcome[] memory outcomes) external returns (address);
}