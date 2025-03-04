// SPDX-Identifier: MIT
pragma solidity 0.8.20;

import "./INineLivesTrading.sol";
import "./INineLivesFactory.sol";
import "./ILongtail.sol";
import "./IWETH10.sol";

import "./HelperFactory.sol";

interface IERC20 {
    function transferFrom(address sender, address recipient, uint256 value) external;
    function approve(address recipient, uint256 amount) external;
}

contract BuyHelper {
    INineLivesFactory immutable FACTORY;
    ILongtail immutable LONGTAIL;
    IERC20 immutable FUSDC;
    IWETH10 immutable WETH;
    HelperFactory immutable HELPER;

    constructor(
        INineLivesFactory _factory,
        ILongtail _longtail,
        address _fusdc,
        IWETH10 _weth,
        HelperFactory _helper
    ) {
        FACTORY = _factory;
        LONGTAIL = _longtail;
        FUSDC = IERC20(_fusdc);
        WETH = _weth;
        HELPER = _helper;
    }

    /**
     * @notice Mint some shares at the trading id and outcome given, using Longtail to make a
     *         swap to fUSDC from the asset given.
     */
    function _mint(
        bytes32 _id,
        uint256 _fusdc,
        bytes8 _outcome,
        uint256 _minShareOut
    ) internal returns (uint256) {
        // We don't explicitly guard for the amount out, since the minimum shares
        // out should protect us from abuse.
        address tradingAddr = FACTORY.getTradingAddr(_id);
        require(tradingAddr != address(0), "trading addr not found");
        FUSDC.approve(tradingAddr, _fusdc);
        uint256 shares = INineLivesTrading(tradingAddr).mintPermitE90275AB(
            _outcome,
            _fusdc,
            msg.sender,
            0,
            0,
            bytes32(0),
            bytes32(0)
        );
        require(shares >= _minShareOut, "not enough shares");
        return shares;
    }

    function _swapInAsset(address _asset, uint256 _amount) internal returns (uint256) {
        if (_asset != address(0)) {
            IERC20(_asset).transferFrom(msg.sender, address(this), _amount);
        } else {
            WETH.deposit{value: msg.value}();
        }
        if (_asset != address(FUSDC)) {
            (int256 amount0,) = LONGTAIL.swapIn32502CA71(_asset, _amount, 0);
            return uint256(amount0);
        } else {
            return _amount;
        }
    }

    function mint(
        bytes32 _id,
        address _asset,
        bytes8 _outcome,
        uint256 _minShareOut,
        uint256 _amount
    ) external payable returns (uint256) {
        uint256 fusdc = _swapInAsset(_asset, _amount);
        return _mint(_id, fusdc, _outcome, _minShareOut);
    }

    function mintSetupAI(
        FactoryOutcome[] calldata _outcomes,
        uint64 _timeEnding,
        bytes32 _documentation,
        address _feeRecipient,
        uint64 _feeCreator,
        uint64 _feeLp,
        uint64 _feeMinter,
        IERC20 _asset,
        bytes8 _outcome,
        uint256 _minShareOut,
        uint256 _amount
    ) external payable returns (uint256) {
        // Sets up the contract given using the AI resolver, deducts fees
        // needed, then tries to mint shares the normal way.
        uint256 fusdc = _swapInAsset(address(_asset), _amount);
        uint256 incentiveAmt = (_outcomes.length * 1e6);
        require(fusdc > incentiveAmt);
        fusdc -= incentiveAmt;
        HELPER.createWithAI(
            _outcomes,
            _timeEnding,
            _documentation,
            _feeRecipient,
            _feeCreator,
            _feeLp,
            _feeMinter
        );
        return _mint(_outcome, fusdc, _outcome, _minShareOut);
    }
}
