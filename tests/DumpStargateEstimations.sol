// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import "../src/IStargate.sol";

import {
    ICamelotSwapRouter,
    ExactOutputSingleParams } from "../src/ICamelotSwapRouter.sol";

import { IWETH10 } from "../src/IWETH10.sol";

interface IERC20 {
    function transferFrom(address,address,uint256) external;
    function approve(address, uint256) external;
    function balanceOf(address) external view returns (uint256);
}

// Tool for interrogating what Stargate will return from a contract call
// using a forked environment.
contract DumpStargateEstimations {
    IERC20 constant public USDC = IERC20(0x6c030c5CC283F791B26816f325b9C632d964F8A1);
    IStargate constant public STARGATE = IStargate(0x8EE21165Ecb7562BA716c9549C1dE751282b9B33);
    uint32 constant public RECIPIENT_CHAIN = 30110;
    ICamelotSwapRouter constant public SWAP_ROUTER = ICamelotSwapRouter(0xC216fCdEb961EEF95657Cb45dEe20e379C7624B8);
    IWETH10 constant public WETH = IWETH10(0x1fB719f10b56d7a85DCD32f27f897375fB21cfdd);

    function estimateBridgeOut(uint256 amt) external returns (uint256) {
        USDC.transferFrom(msg.sender, address(this), amt);
        USDC.approve(address(STARGATE), amt);
        address recipient = 0x6221A9c005F6e47EB398fD867784CacfDcFFF4E7;
        SendParam memory sendParam = SendParam({
            dstEid: RECIPIENT_CHAIN,
            to: bytes32(uint256(uint160(recipient))),
            amountLD: amt,
            minAmountLD: 0,
            extraOptions: new bytes(0),
            composeMsg: new bytes(0),
            oftCmd: "" // Empty for taxi mode
        });
        MessagingFee memory messagingFee = STARGATE.quoteSend(sendParam, false);
        USDC.approve(address(SWAP_ROUTER), amt);
        amt -= SWAP_ROUTER.exactOutputSingle(ExactOutputSingleParams({
            tokenIn: address(USDC),
            tokenOut: address(WETH),
            fee: 0,
            recipient: address(this),
            deadline: type(uint256).max,
            amountOut: messagingFee.nativeFee,
            amountInMaximum: amt,
            limitSqrtPrice: type(uint160).min
        }));
        WETH.withdraw(messagingFee.nativeFee);
        sendParam.amountLD = amt;
        (, , OFTReceipt memory receipt) = STARGATE.quoteOFT(sendParam);
        sendParam.minAmountLD = receipt.amountReceivedLD;
        USDC.approve(address(STARGATE), amt);
        (, OFTReceipt memory oftReceipt,) =
            STARGATE.sendToken{value: messagingFee.nativeFee}(
                sendParam,
                messagingFee,
                recipient
            );
        return oftReceipt.amountSentLD;
    }

    receive() external payable {}
}
