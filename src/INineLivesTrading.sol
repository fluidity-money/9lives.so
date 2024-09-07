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
     * @param recipient of the funds spent.
     * @param v to use for the permit signature
     * @param r to use for permit.
     * @param s to use for permit.
     */
    function mintPermit(
        bytes8 outcome,
        uint256 value,
        address recipient,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) external returns (uint256);
}
