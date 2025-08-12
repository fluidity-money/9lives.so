// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import {
    IStargate,
    MessagingFee,
    SendParam,
    OFTReceipt,
    MessagingReceipt,
    StargateType,
    Ticket,
    OFTLimit,
    OFTFeeDetail } from "../src/IStargate.sol";

contract MockStargate is IStargate {
    function sendToken(
        SendParam calldata /* _sendParam */,
        MessagingFee calldata /* _fee */,
        address /* _refundAddress */
    ) external payable returns (
        MessagingReceipt memory msgReceipt,
        OFTReceipt memory oftReceipt,
        Ticket memory ticket
    ) {
        require(msg.value == 76973247383465, "not mocked");
        oftReceipt.amountReceivedLD = 24713502;
    }

    function stargateType() external pure returns (StargateType) {
        revert("unimplemented");
    }

    function quoteOFT(
        SendParam calldata _sendParam
    ) external view returns (
        OFTLimit memory limit,
        OFTFeeDetail[] memory oftFeeDetails,
        OFTReceipt memory receipt
    ) {
        require(_sendParam.amountLD == 24713502, "not mocked");
        receipt.amountReceivedLD = 24698673;
    }

    function quoteSend(
        SendParam calldata _sendParam,
        bool _payInLzToken
    ) external view returns (MessagingFee memory f) {
        require(
            !_payInLzToken && _sendParam.amountLD == 25000000,
            "not mocked"
        );
        f.nativeFee = 76973247383465;
    }
}
