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

contract HelperFactory {
    IERC20Permit immutable FUSDC;
    INineLivesFactory immutable FACTORY;
    address immutable INFRA_MARKET;
    address immutable BEAUTY_CONTEST;

    constructor(
        IERC20Permit _fusdc,
        INineLivesFactory _factory,
        address _infraMarket,
        address _beautyContest
    ) {
        FACTORY = _factory;
        INFRA_MARKET = _infraMarket;
        FUSDC = _fusdc;
        BEAUTY_CONTEST = _beautyContest;
        FUSDC.approve(address(_factory), type(uint256).max);
        FUSDC.approve(address(_infraMarket), type(uint256).max);
    }

    function create(
        address oracle,
        FactoryOutcome[] calldata outcomes,
        uint64 timeEnding,
        bytes32 documentation,
        address feeRecipient
    ) internal returns (address) {
        return FACTORY.newTrading09393DA8(
            outcomes,
            oracle,
            uint64(block.timestamp + 1),
            timeEnding,
            documentation,
            feeRecipient
        );
    }

    function createWithInfraMarket(
        FactoryOutcome[] calldata outcomes,
        uint64 timeEnding,
        bytes32 documentation,
        address feeRecipient
    ) public returns (address tradingAddr) {
        // We need to take the base incentive amount for transfers.
        FUSDC.transferFrom(msg.sender, address(this), (outcomes.length * 1e6) + 3000000);
        return create(
            INFRA_MARKET,
            outcomes,
            timeEnding,
            documentation,
            feeRecipient
        );
    }

    // Create a campaign with an infra market, doing all the setup legwork that's needed
    // with approvals stemming from a single signature.
    function createWithInfraMarketPermit(
        FactoryOutcome[] calldata outcomes,
        uint64 timeEnding,
        bytes32 documentation,
        address feeRecipient,
        uint256 deadline,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) external returns (address tradingAddr) {
        // We need to take some money from the sender for all the setup costs we're expecting.
        // This should be the (number of outcomes * 1e6) + 10e6
        FUSDC.permit(msg.sender, address(this), (outcomes.length * 1e6) + 3000000, deadline, v, r, s);
        return create(INFRA_MARKET, outcomes, timeEnding, documentation, feeRecipient);
    }

    function createWithBeautyContest(
        FactoryOutcome[] calldata outcomes,
        uint64 timeEnding,
        bytes32 documentation,
        address feeRecipient
    ) public returns (address tradingAddr) {
        // No extra fluff work is needed to support this.
        FUSDC.transferFrom(msg.sender, address(this), (outcomes.length * 1e6));
        return create(BEAUTY_CONTEST, outcomes, timeEnding, documentation, feeRecipient);
    }

    function createWithBeautyContestPermit(
        FactoryOutcome[] calldata outcomes,
        uint64 timeEnding,
        bytes32 documentation,
        address feeRecipient,
        uint256 deadline,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) external returns (address tradingAddr) {
        FUSDC.permit(msg.sender, address(this), (outcomes.length * 1e6), deadline, v, r, s);
        return create(BEAUTY_CONTEST, outcomes, timeEnding, documentation, feeRecipient);
    }
}
