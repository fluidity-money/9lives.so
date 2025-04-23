// SPDX-Identifier: MIT

pragma solidity 0.8.20;

import "./INineLivesFactory.sol";

interface IERC20Permit {
    function permit(
        address owner,
        address spender,
        uint256 value,
        uint256 deadline,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) external;
    function approve(address spender, uint256 amount) external;
    function transferFrom(address owner, address spender, uint256 amount) external;
}

uint256 constant INCENTIVE_AMT_MODERATION = 1e6;

uint256 constant INCENTIVE_INFRA_MARKET = 2200000;

struct CreationDetails {
    FactoryOutcome[] outcomes;
    uint64 timeEnding;
    bytes32 documentation;
    address feeRecipient;
    uint64 feeCreator;
    uint64 feeLp;
    uint64 feeMinter;
}

/**
 * @notice HelperFactory that assists in deploying different amounts, it does not take any fees
 *        currently to reflect the new AMM model.
 */
contract HelperFactory {
    IERC20Permit immutable FUSDC;
    INineLivesFactory immutable FACTORY;
    address immutable public INFRA_MARKET;
    address immutable public BEAUTY_CONTEST;
    address immutable public SARP_AI;

    constructor(
        IERC20Permit _fusdc,
        INineLivesFactory _factory,
        address _infraMarket,
        address _beautyContest,
        address _sarpAi
    ) {
        FACTORY = _factory;
        INFRA_MARKET = _infraMarket;
        FUSDC = _fusdc;
        BEAUTY_CONTEST = _beautyContest;
        SARP_AI = _sarpAi;
        FUSDC.approve(address(_factory), type(uint256).max);
    }

    function create(
        address oracle,
        FactoryOutcome[] calldata outcomes,
        uint64 timeEnding,
        bytes32 documentation,
        address feeRecipient,
        uint64 feeCreator,
        uint64 feeLp,
        uint64 feeMinter
    ) internal returns (address) {
        require(timeEnding > block.timestamp, "time ending before timestamp");
        return FACTORY.newTrading90C25562(
            outcomes,
            oracle,
            uint64(block.timestamp + 1),
            timeEnding,
            documentation,
            feeRecipient,
            feeCreator,
            feeLp,
            feeMinter
        );
    }

    function createWithBeautyContest(
        FactoryOutcome[] calldata outcomes,
        uint64 timeEnding,
        bytes32 documentation,
        address feeRecipient,
        uint64 feeCreator,
        uint64 feeLp,
        uint64 feeMinter
    ) public returns (address tradingAddr) {
        return create(
            BEAUTY_CONTEST,
            outcomes,
            timeEnding,
            documentation,
            feeRecipient,
            feeCreator,
            feeLp,
            feeMinter
        );
    }

    function createWithAI(
        FactoryOutcome[] calldata outcomes,
        uint64 timeEnding,
        bytes32 documentation,
        address feeRecipient,
        uint64 feeCreator,
        uint64 feeLp,
        uint64 feeMinter
    ) public returns (address tradingAddr) {
        return create(
            SARP_AI,
            outcomes,
            timeEnding,
            documentation,
            feeRecipient,
            feeCreator,
            feeLp,
            feeMinter
        );
    }

    /// @dev It doesn't make sense to use this. It's better to do the
    /// setup work yourself with the factory, this is left for convinience
    /// reasons. It transfers some fUSDC to the contract for setup.
    function createWithCustom(
        address oracle,
        FactoryOutcome[] calldata outcomes,
        uint64 timeEnding,
        bytes32 documentation,
        address feeRecipient,
        uint64 feeCreator,
        uint64 feeLp,
        uint64 feeMinter
    ) public returns (address tradingAddr) {
        return create(
            oracle,
            outcomes,
            timeEnding,
            documentation,
            feeRecipient,
            feeCreator,
            feeLp,
            feeMinter
        );
    }
}
