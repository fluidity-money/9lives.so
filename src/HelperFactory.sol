// SPDX-Identifier: MIT

pragma solidity 0.8.20;

import { INineLivesFactory, FactoryOutcome } from "./INineLivesFactory.sol";
import { INineLivesTrading } from "./INineLivesTrading.sol";

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

struct CreateArgs {
    address oracle;
    FactoryOutcome[] outcomes;
    uint64 timeEnding;
    bytes32 documentation;
    address feeRecipient;
    uint64 feeCreator;
    uint64 feeLp;
    uint64 feeMinter;
    uint64 feeReferrer;
    uint256 seedLiquidity;
    bool isDppm;
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

    /// Create a new campaign, ignoring the CreateArgs oracle argument.
    function create(address _oracle, CreateArgs calldata _a) internal returns (address) {
        require(_a.timeEnding > block.timestamp, "time ending before timestamp");
        INineLivesTrading t = INineLivesTrading(FACTORY.newTrading37E9F4BE(
            _a.outcomes,
            _oracle,
            uint64(block.timestamp),
            _a.timeEnding,
            _a.documentation,
            _a.feeRecipient,
            _a.feeCreator,
            _a.feeLp,
            _a.feeMinter,
            _a.feeReferrer,
            _a.isDppm,
            // TODO: hardcoded since we don't use this to create DPPM markets.
            0
        ));
        if (_a.seedLiquidity > 0) {
            FUSDC.transferFrom(msg.sender, address(this), _a.seedLiquidity);
            FUSDC.approve(address(t), _a.seedLiquidity);
            t.addLiquidityB9DDA952(_a.seedLiquidity, msg.sender, 0, type(uint256).max);
        }
        return address(t);
    }

    function createWithBeautyContest(CreateArgs calldata _a) public returns (address tradingAddr) {
        return create(BEAUTY_CONTEST, _a);
    }

    function createWithAI(CreateArgs calldata _a) public returns (address tradingAddr) {
        return create(SARP_AI, _a);
    }

    /// @dev It doesn't make sense to use this. It's better to do the
    /// setup work yourself with the factory, this is left for convinience
    /// reasons. It transfers some fUSDC to the contract for setup.
    function createWithCustom(CreateArgs calldata _a) public returns (address tradingAddr) {
        return create(_a.oracle, _a);
    }
}
