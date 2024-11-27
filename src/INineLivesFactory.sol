// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import {Outcome} from "./INineLivesTrading.sol";

interface INineLivesFactory {
    /**
     * @notice Construct the Factory, configuring all Trading instances to use the oracle
     *         given.
     * @notice shareImpl to use for the share creations with a proxy.
     * @param tradingExtrasImpl to use as the extras implementation for the extras trading
     * code.
     * @param tradingMintImpl to use as the implementation of the mint code for deployed
     * Tradings.
     * @param infraMarketOracle to set as the oracle for infrastructure market oracles
     */
    function ctor(
        address shareImpl,
        address tradingExtrasImpl,
        address tradingMintImpl,
        address infraMarketOracle
    ) external;

    /**
     * @notice set up new trading contract, seeding the initial amounts
     * @param outcomes to set up as the default
     * @param oracle to use as the provider. If set to 0, then a beauty contest is taking
     * place, and when an oracle resolves it checks its own invested state to determine the
     * winner. If set to the address of the infra market oracle as set up during the
     * initialisation of the proxy contract, then an infrastructure market is taking place.
     * If set to anything else, then a contract interaction is assumed being active (or, an
     * AI resolver, depending on the circumstances). If the infrastructure market
     * was chosen, then the code calls the Infrastructure Market to create a new market there
     * with its own creation time.
     * @param timeStart to begin this contract at. This should be in the future.
     * @param timeEnding to end this contract at. This should be in the future.
     * @param documentation keccak'd hash of the information that makes up the description
     * for infrastructure markets. This is sent out there.
     * @param feeRecipient to send fees earned from the 10% commission to.
     * @return tradingAddr address of the newly created Trading contract deployment.
     */
    function newTrading(
        Outcome[] memory outcomes,
        address oracle,
        uint64 timeStart,
        uint64 timeEnding,
        bytes32 documentation,
        address feeRecipient
    ) external returns (address tradingAddr);

    /**
     * @notice gets the owner address from the trading contract address
     * @param addr is trading address to get the owner
     */
    function getOwner(address addr) external view returns (address);

    function erc20Impl() external pure returns (address);

    /**
     * @notice return the keccak256 hash of the trading contract
     */
    function tradingHash() external view returns (bytes32);

    /**
     * @notice return the keccak256 hash of the ERC20
     */
    function erc20Hash() external view returns (bytes32);
}
