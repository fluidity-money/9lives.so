// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "../src/Share.sol";

import "../src/INineLivesTrading.sol";

interface IERC20TransferFrom {
    function transfer(address recipient, uint256 value) external;
    function transferFrom(address sender, address recipient, uint256 value) external;
}

contract MockTrading is INineLivesTrading {
    mapping(bytes8 => Share) shares_;
    address immutable FUSDC_ADDR;
    IERC20 immutable SHARE_ADDR;
    uint256 counter_;

    address oracle_;
    uint256 timeStart_;
    uint256 timeEnding_;
    address feeRecipient_;

    constructor(address _fusdc, address _shareAddr) {
        FUSDC_ADDR = _fusdc;
        SHARE_ADDR = IERC20(_shareAddr);
    }

    function ctor(
        bytes8[] memory outcomes,
        address _oracle,
        uint256 _timeStart,
        uint256 _timeEnding,
        address _feeRecipient,
        address /* _shareImpl */,
        bool /* _shouldExtend */
    ) external {
        require(timeStart_ == 0, "already created");
        // We track some things to set up to prevent abuse in testing, but we don't
        // track the oracles that were created.
        for (uint i = 0; i < outcomes.length; ++i) {
            shares_[outcomes[i]] = new Share();
            shares_[outcomes[i]].ctor("", address(this));
        }
        oracle_ = _oracle;
        timeStart_ = _timeStart;
        require(timeStart_ > block.timestamp, "start in the past");
        timeEnding_ = _timeEnding;
        require(timeEnding_ > block.timestamp, "ending in the past");
        require(timeEnding_ > timeStart_, "starting in the past");
        feeRecipient_ = _feeRecipient;
    }

    function mintPermitE90275AB(
        bytes8 outcome,
        uint256 value,
        address recipient,
        uint256 /* deadline */,
        uint8 /* v */,
        bytes32 /* r */,
        bytes32 /* s */
    ) external returns (uint256) {
        require(block.timestamp > timeStart_, "hasn't started");
        require(block.timestamp < timeEnding_, "has ended");
        IERC20TransferFrom(FUSDC_ADDR).transferFrom(msg.sender, address(this), value);
        shares_[outcome].mint(recipient, value);
        return value;
    }

    function quoteC0E17FC7(
        bytes8 /* outcome */,
        uint256 value
    ) external returns (uint256) {
        ++counter_;
        return value;
    }

    function priceA827ED27(bytes8 /* outcome */) external returns (uint256) {
        ++counter_;
        return uint256(keccak256(abi.encodePacked(block.timestamp)));
    }

    function shutdown() external returns (uint256) {
        // Do nothing, for now...
        ++counter_;
        return counter_;
    }

    function decide(bytes8 /* outcome */) external {
        // Do nothing
        ++counter_;
    }

    function payoff91FA8C2E(
        bytes8 outcome,
        uint256 amount,
        address recipient
    ) external returns (uint256) {
        IERC20TransferFrom(FUSDC_ADDR).transfer(recipient, amount);
        shares_[outcome].burn(msg.sender, amount);
        return amount;
    }

    function details(bytes8 /* outcomeId */) external pure returns (
        uint256 shares,
        uint256 investedAmt,
        uint256 globalInvested,
        bytes8 winner
    ) {
        return (100, 10_000, 19291, bytes8(uint64(1)));
    }

    function isDpm() external pure returns (bool) {
        return true;
    }

    function globalShares() external pure returns (uint256) {
        return 50_000;
    }

    function invested() external pure returns (uint256) {
        return 10_000;
    }

    function shareAddr(bytes8 outcome) external view returns (address) {
        return address(shares_[outcome]);
    }
}
