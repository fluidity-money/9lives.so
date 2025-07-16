// SPDX-Identifier: MIT
pragma solidity 0.8.20;

import { INineLivesTrading } from "./INineLivesTrading.sol";
import { INineLivesFactory } from "./INineLivesFactory.sol";
import { ILongtail } from "./ILongtail.sol";
import { IWETH10 } from "./IWETH10.sol";
import  { ICamelotSwapRouter, ExactInputSingleParams } from "./ICamelotSwapRouter.sol";

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

struct SendParam {
    uint32 dstEid; // Destination endpoint ID.
    bytes32 to; // Recipient address.
    uint256 amountLD; // Amount to send in local decimals.
    uint256 minAmountLD; // Minimum amount to send in local decimals.
    bytes extraOptions; // Additional options supplied by the caller to be used in the LayerZero message.
    bytes composeMsg; // The composed message for the send() operation.
    bytes oftCmd; // The OFT command to be executed, unused in default OFT implementations.
}

struct OFTReceipt {
    uint256 amountSentLD; // Amount of tokens ACTUALLY debited from the sender in local decimals.
    // @dev In non-default implementations, the amountReceivedLD COULD differ from this value.
    uint256 amountReceivedLD; // Amount of tokens to be received on the remote side.
}

struct MessagingReceipt {
    bytes32 guid;
    uint64 nonce;
    MessagingFee fee;
}

struct MessagingFee {
    uint256 nativeFee;
    uint256 lzTokenFee;
}

enum StargateType {
    Pool,
    OFT
}

/// @notice Ticket data for bus ride.
struct Ticket {
    uint72 ticketId;
    bytes passengerBytes;
}

struct OFTLimit {
    uint256 minAmountLD; // Minimum amount in local decimals that can be sent to the recipient.
    uint256 maxAmountLD; // Maximum amount in local decimals that can be sent to the recipient.
}

struct OFTFeeDetail {
    int256 feeAmountLD; // Amount of the fee in local decimals.
    string description; // Description of the fee.
}

interface IStargate {
    /// @dev This function is same as `send` in OFT interface but returns the ticket data if in the bus ride mode,
    /// which allows the caller to ride and drive the bus in the same transaction.
    function sendToken(
        SendParam calldata _sendParam,
        MessagingFee calldata _fee,
        address _refundAddress
    ) external payable returns (MessagingReceipt memory msgReceipt, OFTReceipt memory oftReceipt, Ticket memory ticket);

    /// @notice Returns the Stargate implementation type.
    function stargateType() external pure returns (StargateType);

    function quoteOFT(
        SendParam calldata _sendParam
    ) external view returns (OFTLimit memory limit, OFTFeeDetail[] memory oftFeeDetails, OFTReceipt memory receipt);
}

contract BuyHelper2 {
    INineLivesFactory immutable public FACTORY;
    ILongtail immutable public LONGTAIL;
    IERC20 immutable public FUSDC;
    IWETH10 immutable public WETH;
    ICamelotSwapRouter immutable public CAMELOT_SWAP_ROUTER;
    IStargate immutable public STARGATE;

    constructor(
        INineLivesFactory _factory,
        ILongtail _longtail,
        address _fusdc,
        IWETH10 _weth,
        ICamelotSwapRouter _camelotSwapRouter,
        IStargate _stargate
    ) {
        FACTORY = _factory;
        LONGTAIL = _longtail;
        FUSDC = IERC20(_fusdc);
        WETH = _weth;
        CAMELOT_SWAP_ROUTER = _camelotSwapRouter;
        STARGATE = _stargate;
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

    function burnWithStargate(
        address _tradingAddr,
        bytes8 _outcome,
        uint256 _minFusdc,
        uint256 _maxShareOut,
        uint256 _minShareOut,
        address _referrer,
        uint32 _dstEid,
        address _receiver
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
            address(this)
        );
        require(fusdcReturned >= _minFusdc, "not enough fusdc returned");
        uint256 toSend = shareAddr.balanceOf(address(this));
        // Use Stargate to send the amounts here.
        SendParam memory sendParam = SendParam({
            dstEid: _dstEid,
            to: bytes32(uint256(uint160(_receiver))),
            amountLD: fusdcReturned, // Not sent with local decimals.
            minAmountLD: 0,
            extraOptions: new bytes(0),
            composeMsg: new bytes(0),
            oftCmd: ""                  // Empty for taxi mode
        });
        (, , OFTReceipt memory receipt) = STARGATE.quoteOFT(sendParam);
    }
}
