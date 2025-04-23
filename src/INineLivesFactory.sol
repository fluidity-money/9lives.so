// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

struct FactoryOutcome {
    bytes8 identifier;
    uint256 sqrtPrice;
    string name;
}

interface INineLivesFactory {
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
     * @param feeRecipient to send fees earned from the creator commission to.
     * @param feeCreator pct to take as fees for the creator given.
     * @param feeLp pct to take as fees for LPs who use the add/remove liquidity features.
     * @param feeMinter pct to take as fees for users using the mint function.
     * @return tradingAddr address of the newly created Trading contract deployment.
     */
    function newTrading90C25562(
        FactoryOutcome[] memory outcomes,
        address oracle,
        uint64 timeStart,
        uint64 timeEnding,
        bytes32 documentation,
        address feeRecipient,
        uint64 feeCreator,
        uint64 feeLp,
        uint64 feeMinter
    ) external returns (address tradingAddr);

    /**
     * @notice is the current fee that's taken for moderation reasons active?
     */
    function isModerationFeeEnabled() external view returns (bool);

    /**
     * @notice gets the owner address from the trading contract address
     * @param addr is trading address to get the owner
     */
    function getOwner(address addr) external view returns (address);

    function getBackend(address addr) external view returns (uint8);

    function getTradingAddr(bytes32 id) external view returns (address);

    function shareImpl() external pure returns (address);

    /**
     * @notice return the keccak256 hash of the trading contract in DPM form.
     */
    function dpmTradingHash() external view returns (bytes32);

    /**
     * @notice return the keccak256 hash of the trading contract in AMM form.
     */
    function ammTradingHash() external view returns (bytes32);

    /**
     * @notice return the keccak256 hash of the ERC20
     */
    function erc20Hash() external view returns (bytes32);
}
