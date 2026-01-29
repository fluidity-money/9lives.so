// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import {IEvents} from "./IEvents.sol";

interface IERC20 {
    function transferFrom(address from, address to ,uint256 amount) external;
    function transfer(address recipient, uint256 amount) external;
    function balanceOf(address spender) external view returns (uint256);
}

/// @notice The vault serves as a liquidity vehicle for market creation using a
///         shared bucket of liquidity. Dao-earned fees are repaid to this vault
///         when the market is resolved, subtracting what's needed to earn more
///         than the fees.
contract Vault is IEvents {
    IERC20 immutable ERC20;
    address immutable FACTORY;
    address immutable OPERATOR;

    uint256 public outstandingDebt;

    mapping(address => uint256) debt;

    constructor(IERC20 _erc20, address _factory, address _operator) {
        ERC20 = _erc20;
        FACTORY = _factory;
        OPERATOR = _operator;
    }

    function borrow(address _for, uint256 _amount) external {
        require(msg.sender == FACTORY, "not factory");
        debt[_for] += _amount;
        outstandingDebt += _amount;
        emit DebtTaken(msg.sender, _for, _amount);
    }

    function repay(uint256 _feesEarned) external {
        uint256 needs = debt[msg.sender];
        debt[msg.sender] = 0;
        outstandingDebt -= needs;
        if (_feesEarned >= needs) {
            uint256 take = _feesEarned - needs;
            if (take > 0) ERC20.transferFrom(msg.sender, address(this), take);
            emit DebtRepaid(msg.sender, take, 0);
        } else {
            uint256 shortfall = needs - _feesEarned;
            if (_feesEarned > 0) ERC20.transferFrom(msg.sender, address(this), _feesEarned);
            ERC20.transfer(msg.sender, shortfall);
            emit DebtRepaid(msg.sender, _feesEarned, shortfall);
        }
    }

    function drain() external returns (uint256 amt) {
        amt = ERC20.balanceOf(address(this)) - outstandingDebt;
        ERC20.transfer(OPERATOR, amt);
    }
}
