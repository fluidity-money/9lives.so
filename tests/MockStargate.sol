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
        SendParam calldata _sendParam,
        MessagingFee calldata _fee,
        address _refundAddress
    ) external payable returns (
        MessagingReceipt memory msgReceipt,
        OFTReceipt memory oftReceipt,
        Ticket memory ticket
    ) {
        require(false);
    }

    function stargateType() external pure returns (StargateType) {
        require(false);
    }

    function quoteOFT(
        SendParam calldata _sendParam
    ) external view returns (
        OFTLimit memory limit,
        OFTFeeDetail[] memory oftFeeDetails,
        OFTReceipt memory receipt
    ) {
        require(false);
    }

    function quoteSend(
        SendParam calldata _sendParam,
        bool _payInLzToken
    ) external view returns (MessagingFee memory) {
        require(false);
    }
}
