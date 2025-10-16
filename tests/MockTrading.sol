// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import { Share } from "../src/Share.sol";

import { INineLivesTrading, CtorArgs } from "../src/INineLivesTrading.sol";

import {
    TransparentUpgradeableProxy} from "@openzeppelin/contracts/proxy/transparent/TransparentUpgradeableProxy.sol";


interface IERC20TransferFrom {
    function transfer(address recipient, uint256 value) external;
    function transferFrom(address sender, address recipient, uint256 value) external;
}

contract MockTrading is INineLivesTrading {
    mapping(bytes8 => Share) shares_;
    address immutable FUSDC_ADDR;
    address immutable PAYMASTER;

    uint256 counter_;

    bytes8 public calledOutcome_;

    mapping(address => uint256) providedLiquidity_;

    address oracle_;
    uint256 timeStart_;
    uint256 timeEnding_;
    address feeRecipient_;

    constructor(address _fusdc, address _paymaster) {
        FUSDC_ADDR = _fusdc;
        PAYMASTER = _paymaster;
    }

    function ctor(CtorArgs calldata _a) external {
        require(timeStart_ == 0, "already created");
        for (uint i = 0; i < _a.outcomes.length; ++i) {
            Share s = Share(address(new TransparentUpgradeableProxy(
                address(new Share()),
                msg.sender,
                ""
            )));
            s.ctor("Test Share", address(this));
            shares_[_a.outcomes[i]] = s;
        }
        oracle_ = _a.oracle;
        timeStart_ = _a.timeStart;
        timeEnding_ = _a.timeEnding;
        require(timeEnding_ > block.timestamp, "ending in the past");
        require(timeEnding_ > timeStart_, "starting in the past");
        feeRecipient_ = _a.feeRecipient;
    }

    function oracle() external view returns (address) {
        return oracle_;
    }

    function mint8A059B6E(
        bytes8 outcome,
        uint256 value,
        address /* referrer */,
        address recipient
    ) external returns (uint256) {
        require(block.timestamp > timeStart_, "hasn't started");
        require(block.timestamp < timeEnding_, "has ended");
        IERC20TransferFrom(FUSDC_ADDR).transferFrom(msg.sender, address(this), value);
        shares_[outcome].mint(recipient, value);
        return value;
    }

    function burn854CC96E(
        bytes8 outcome,
        uint256 /* maxShareOut */,
        bool /* shouldTakeShares */,
        uint256 minShares,
        address /* referrer */,
        address recipient
    ) external returns (uint256 burnedShares, uint256 fusdcReturned) {
        address sender = msg.sender;
        if (msg.sender == PAYMASTER) sender = recipient;
        ++counter_;
        shares_[outcome].burn(sender, minShares);
        IERC20TransferFrom(FUSDC_ADDR).transfer(sender, minShares);
        return (minShares, minShares);
    }

    function quoteC0E17FC7(
        bytes8 /* outcome */,
        uint256 value
    ) external returns (uint256, uint256) {
        ++counter_;
        return (value, 5);
    }

    function estimateBurnC04425D3(
        bytes8 /* outcome */,
        uint256 shareAmount
    ) external returns (uint256) {
        ++counter_;
        return shareAmount;
    }

    function rescue276DD9AB(address /* recipient */) external returns (uint256) {
        ++counter_;
        return 0;
    }

    function estimateBurnE9B09A17(
        bytes8 /* outcome */,
        uint256 shareAmount
    ) external returns (uint256) {
        ++counter_;
        return shareAmount;
    }

    function addLiquidityB9DDA952(
        uint256 liquidity,
        address recipient,
        uint256 /* _minSharesBack */,
        uint256 /* _maxShares */
    ) external returns (
        uint256 userLiquidity
    ) {
        ++counter_;
        IERC20TransferFrom(FUSDC_ADDR).transferFrom(msg.sender, address(this), liquidity);
        providedLiquidity_[recipient] += liquidity;
        return liquidity;
    }

    function removeLiquidity3C857A15(uint256 liquidity, address recipient) external returns (
        uint256 fusdcAmount,
        uint256 feesEarned
    ) {
        ++counter_;
        providedLiquidity_[recipient] -= liquidity;
        IERC20TransferFrom(FUSDC_ADDR).transfer(recipient, liquidity);
        return (liquidity, 0);
    }

    function claimAllFees332D7968(address /* recipient */) external returns (uint256) {
        ++counter_;
        return counter_;
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

    function decide(bytes8 outcome) external {
        ++counter_;
        calledOutcome_ = outcome;
    }

    function payoffCB6F2565(
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

     function outcomeList() external view returns (bytes8[] memory outcomes) {}

    function escape() external {
        ++counter_;
    }

    function timeEnding() external pure returns (uint64) {
        return 0;
    }

    function timeStart() external pure returns (uint64) {
        return 0;
    }

    function isDppm() external pure returns (bool) {
        return false;
    }

    function isDpm() external pure returns (bool) {
        return false;
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

    function version() external pure returns (string memory) {
        return "";
    }

    function fees62DAA154() external view returns (Fees memory f) {
    }

    function userLiquidityShares(address spender) external pure returns (uint256) {
        return uint256(keccak256(abi.encodePacked(spender)));
    }
}
