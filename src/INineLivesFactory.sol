// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

interface INineLivesFactory {
    struct Outcome {
        bytes8 identifier;
        uint256 amount;
    }

    /**
     * @notice set up new trading contract, seeding the initial amounts
     * @param outcomes to set up as the default
     */
    function newTrading(Outcome[] memory outcomes) external returns (address);

    /**
     * @notice gets the owner address from the trading contract address
     * @param addr is trading address to get the owner
     */
    function getOwner(address addr) external view returns (address);

    /**
     * @notice return the keccak256 hash of the trading contract
     */
    function tradingHash() external view returns (bytes32);
}
