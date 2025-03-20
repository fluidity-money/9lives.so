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

    /**
     * @notice Create with the Infra Market, transferring the amount needed for the
     * oracle, as well as the Trading contract itself.
     */
    function createWithInfraMarket(
        FactoryOutcome[] calldata outcomes,
        uint64 timeEnding,
        bytes32 documentation,
        address feeRecipient,
        uint64 feeCreator,
        uint64 feeLp,
        uint64 feeMinter
    ) public returns (address tradingAddr) {
        // We need to take the base incentive amount for transfers.
        FUSDC.transferFrom(msg.sender, address(this), (outcomes.length * 1e6) + INCENTIVE_INFRA_MARKET);
        return create(
            INFRA_MARKET,
            outcomes,
            timeEnding,
            documentation,
            feeRecipient,
            feeCreator,
            feeLp,
            feeMinter
        );
    }

    // Create a campaign with an infra market, doing all the setup legwork that's needed
    // with approvals stemming from a single signature.
    function createWithInfraMarketPermit(
        CreationDetails calldata d,
        uint256 deadline,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) external returns (address tradingAddr) {
        // We need to take some money from the sender for all the setup costs we're expecting.
        // This should be the (number of outcomes * 1e6) + (2.2 * 1e6)
        FUSDC.permit(msg.sender, address(this), (d.outcomes.length * 1e6) + 2200000, deadline, v, r, s);
        return createWithInfraMarket(
            d.outcomes,
            d.timeEnding,
            d.documentation,
            d.feeRecipient,
            d.feeCreator,
            d.feeLp,
            d.feeMinter
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
        // No extra fluff work is needed to support this.
        FUSDC.transferFrom(
            msg.sender,
            address(this),
            (outcomes.length * 1e6) + INCENTIVE_AMT_MODERATION
        );
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

    function createWithBeautyContestPermit(
        CreationDetails calldata d,
        uint256 deadline,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) external returns (address tradingAddr) {
        FUSDC.permit(
            msg.sender,
            address(this),
            (d.outcomes.length * 1e6) + INCENTIVE_AMT_MODERATION,
            deadline,
            v,
            r,
            s
        );
        return createWithBeautyContest(
            d.outcomes,
            d.timeEnding,
            d.documentation,
            d.feeRecipient,
            d.feeCreator,
            d.feeLp,
            d.feeMinter
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
        // No extra fluff work is needed to support this.
        FUSDC.transferFrom(
            msg.sender,
            address(this),
            (outcomes.length * 1e6) + INCENTIVE_AMT_MODERATION
        );
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

    function createWithAIPermit(
        CreationDetails calldata d,
        uint256 deadline,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) external returns (address tradingAddr) {
        FUSDC.permit(
            msg.sender,
            address(this),
            (d.outcomes.length * 1e6) + INCENTIVE_AMT_MODERATION,
            deadline,
            v,
            r,
            s
        );
        return createWithAI(
            d.outcomes,
            d.timeEnding,
            d.documentation,
            d.feeRecipient,
            d.feeCreator,
            d.feeLp,
            d.feeMinter
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
        FUSDC.transferFrom(
            msg.sender,
            address(this),
            (outcomes.length * 1e6) + INCENTIVE_AMT_MODERATION
        );
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

    /// @dev Read the developer comment for createWithCustom.
    function createWithCustomPermit(
        CreationDetails calldata d,
        address oracle,
        uint256 deadline,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) public returns (address tradingAddr) {
        FUSDC.permit(
            msg.sender,
            address(this),
            (d.outcomes.length * 1e6) + INCENTIVE_AMT_MODERATION,
            deadline,
            v,
            r,
            s
        );
        return createWithCustom(
            oracle,
            d.outcomes,
            d.timeEnding,
            d.documentation,
            d.feeRecipient,
            d.feeCreator,
            d.feeLp,
            d.feeMinter
        );
    }
}
