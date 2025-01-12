// SPDX-Identifier: MIT
pragma solidity 0.8.20;

import "./INineLivesTrading.sol";
import "./INineLivesFactory.sol";
import "./ILongtail.sol";
import "./IWETH10.sol";

interface IERC20 {
    function transferFrom(address sender, address recipient, uint256 value) external;
    function approve(address recipient, uint256 amount) external;
}

contract BuyHelper2 {
    INineLivesFactory immutable FACTORY;
    ILongtail immutable LONGTAIL;
    IERC20 immutable FUSDC;
    IWETH10 immutable WETH;

    constructor(
        INineLivesFactory _factory,
        ILongtail _longtail,
        address _fusdc,
        IWETH10 _weth
    ) {
        FACTORY = _factory;
        LONGTAIL = _longtail;
        FUSDC = IERC20(_fusdc);
        WETH = _weth;
    }

    /**
     * @notice Mint some shares at the trading id and outcome given, using Longtail to make a
     *         swap to fUSDC from the asset given.
     */
    function mint(
        address _tradingAddr,
        address _asset,
        bytes8 _outcome,
        uint256 _minShareOut,
        uint256 _amount
    ) external payable returns (uint256) {
        if (_asset != address(0)) {
            IERC20(_asset).transferFrom(msg.sender, address(this), _amount);
        } else {
            WETH.deposit{value: msg.value}();
        }
        uint256 fusdc;
        if (_asset != address(FUSDC)) {
            (int256 amount0,) = LONGTAIL.swapIn32502CA71(_asset, _amount, 0);
            fusdc = uint256(amount0);
        } else {
            fusdc = _amount;
        }
        FUSDC.approve(_tradingAddr, fusdc);
        uint256 shares = INineLivesTrading(_tradingAddr).mintPermitE90275AB(
            _outcome,
            fusdc,
            msg.sender,
            0,
            0,
            bytes32(0),
            bytes32(0)
        );
        require(shares >= _minShareOut, "not enough shares");
        return shares;
    }
}