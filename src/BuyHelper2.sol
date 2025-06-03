// SPDX-Identifier: MIT
pragma solidity 0.8.20;

import "./INineLivesTrading.sol";
import "./INineLivesFactory.sol";
import "./ILongtail.sol";
import "./IWETH10.sol";
import  {ICamelotSwapRouter, ExactInputSingleParams} from "./ICamelotSwapRouter.sol";

interface IERC20 {
    function transferFrom(
        address sender,
        address recipient,
        uint256 value
    ) external;

    function approve(address recipient, uint256 amount) external;
    function balanceOf(address spender) external view returns (uint256);
    function transfer(address spender, uint256 amount) external;
}

interface DPMOld {
    function mintPermitE90275AB(bytes8,uint256,address,uint256,uint8,bytes32,bytes32) external returns (uint256);
}

contract BuyHelper2 {
    INineLivesFactory immutable FACTORY;
    ILongtail immutable LONGTAIL;
    IERC20 immutable FUSDC;
    IWETH10 immutable WETH;
    ICamelotSwapRouter immutable CAMELOT_SWAP_ROUTER;

    constructor(
        INineLivesFactory _factory,
        ILongtail _longtail,
        address _fusdc,
        IWETH10 _weth,
        ICamelotSwapRouter _camelotSwapRouter
    ) {
        FACTORY = _factory;
        LONGTAIL = _longtail;
        FUSDC = IERC20(_fusdc);
        WETH = _weth;
        CAMELOT_SWAP_ROUTER = _camelotSwapRouter;
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
        uint256 _amount,
        address _referrer,
        uint256 _rebate,
        uint256 _deadline,
        address _recipient
    ) external payable returns (uint256) {
       uint256 amountIn  = _amount - _rebate;
        if (_asset != address(0)) {
            require(_rebate == 0, "rebate not possible for erc20");
            IERC20(_asset).transferFrom(msg.sender, address(this), _amount);
        } else {
            require(_amount == msg.value, "inconsistent value");
            WETH.deposit{value: amountIn}();
            _asset = address(WETH);
        }
        uint256 fusdc;
        if (_asset != address(FUSDC)) {
            IERC20(_asset).approve(address(CAMELOT_SWAP_ROUTER), amountIn);
            fusdc = CAMELOT_SWAP_ROUTER.exactInputSingle(ExactInputSingleParams({
                tokenIn: _asset,
                tokenOut: address(FUSDC),
                recipient: address(this),
                deadline: _deadline,
                amountIn: amountIn,
                amountOutMinimum: 0,
                limitSqrtPrice: 0
            }));
        } else {
            fusdc = _amount;
        }
        FUSDC.approve(_tradingAddr, fusdc);
        uint256 shares;
        INineLivesTrading t = INineLivesTrading(_tradingAddr);
        // The DPM is currently on the old signature.
        if (t.isDpm()) {
             shares = DPMOld(address(t)).mintPermitE90275AB(
                _outcome,
                fusdc,
                _recipient,
                0,
                0,
                bytes32(0),
                bytes32(0)
            );
        } else {
             shares = t.mint8A059B6E(
                _outcome,
                fusdc,
                _referrer,
                _recipient
            );
        }
        // This is enough to prevent slippage.
        require(shares >= _minShareOut, "not enough shares");
        if (_rebate > 0) {
            (bool rc,) = _recipient.call{value: _rebate}("");
            require(rc, "recipient didn't receive");
        }
        return shares;
    }

    function burn(
        address _tradingAddr,
        bytes8 _outcome,
        uint256 _minFusdc,
        uint256 _maxShareOut,
        uint256 _minShareOut,
        address _referrer
    ) external returns (uint256, uint256) {
        // In the normal router, this should be possible to get offline.
        INineLivesTrading tradingAddr = INineLivesTrading(_tradingAddr);
        IERC20 shareAddr = IERC20(tradingAddr.shareAddr(_outcome));
        shareAddr.transferFrom(msg.sender, address(this), _maxShareOut);
        (uint256 burnedShares, uint256 fusdcReturned) = tradingAddr.burn854CC96E(
            _outcome,
            _maxShareOut,
            true,
            _minShareOut,
            _referrer,
            msg.sender
        );
        require(fusdcReturned >= _minFusdc, "not enough fusdc returned");
        uint256 toSend = shareAddr.balanceOf(address(this));
        if (toSend > 0) shareAddr.transfer(msg.sender, toSend);
        return (burnedShares, fusdcReturned);
    }
}
