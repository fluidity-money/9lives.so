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

    constructor(IERC20Permit _fusdc, INineLivesFactory _factory, address _infraMarket) {
        FACTORY = _factory;
        INFRA_MARKET = _infraMarket;
        FUSDC = _fusdc;
        FUSDC.approve(address(_factory), type(uint256).max);
        FUSDC.approve(address(_infraMarket), type(uint256).max);
    }

    function createWithInfraMarket(
        FactoryOutcome[] calldata outcomes,
        uint64 timeEnding,
        bytes32 documentation,
        address feeRecipient
    ) public returns (address tradingAddr) {
        // We need to take the base incentive amount for transfers.
        FUSDC.transferFrom(msg.sender, address(this), (outcomes.length * 1e6) + 1e7);
        return FACTORY.newTrading09393DA8(
            outcomes,
            INFRA_MARKET,
            uint64(block.timestamp + 1),
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
        FUSDC.permit(msg.sender, address(this), (outcomes.length * 1e6) + 1e7, deadline, v, r, s);
        return createWithInfraMarket(outcomes, timeEnding, documentation, feeRecipient);
    }
}
