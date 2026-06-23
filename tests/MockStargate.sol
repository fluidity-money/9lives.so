// SPDX-License-Identifier: MIT
pragma solidity 0.8.30;

import {
    IStargate,
    MessagingFee,
    SendParam,
    OFTReceipt,
    MessagingReceipt,
    StargateType,
    Ticket,
    OFTLimit,
    OFTFeeDetail
} from "../src/IStargate.sol";

contract MockStargate is IStargate {
    function sendToken(
        SendParam calldata,
        /* _sendParam */
        MessagingFee calldata,
        /* _fee */
        address /* _refundAddress */
    )
        external
        payable
        returns (MessagingReceipt memory msgReceipt, OFTReceipt memory oftReceipt, Ticket memory ticket)
    {
        require(msg.value == 76973247383465, "not mocked");
        // Silencing annoying compiler messages:
        msgReceipt.guid = bytes32(0);
        ticket.ticketId = 0;
        oftReceipt.amountReceivedLD = 24713502;
    }

    function stargateType() external pure returns (StargateType) {
        revert("unimplemented");
    }

    function quoteOFT(SendParam calldata _sendParam)
        external
        view
        returns (OFTLimit memory limit, OFTFeeDetail[] memory oftFeeDetails, OFTReceipt memory receipt)
    {
        oftFeeDetails = new OFTFeeDetail[](0);
        require(_sendParam.amountLD == 24713502, "not mocked");
        limit.minAmountLD = 0;
        receipt.amountReceivedLD = 24698673;
    }

    function quoteSend(SendParam calldata _sendParam, bool _payInLzToken)
        external
        view
        returns (MessagingFee memory f)
    {
        require(!_payInLzToken && _sendParam.amountLD == 25000000, "not mocked");
        f.nativeFee = 76973247383465;
    }
}
