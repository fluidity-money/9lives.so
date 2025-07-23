// SPDX-Identifier: MIT
pragma solidity 0.8.20;

// Mocked since I don't like the GPL licensing in the original contract.

import { IWETH10 } from "../src/IWETH10.sol";

contract MockWETH10 is IWETH10 {
    mapping(address => uint256) public balanceOf;

    function deposit() external payable {
        balanceOf[msg.sender] += msg.value;
    }

    function withdraw(uint256 _amt) external {
        balanceOf[msg.sender] -= _amt;
        (bool rc,) = msg.sender.call{value: _amt}("");
        require(rc, "failed to send eth");
    }

    function transfer(address _recipient, uint256 _amt) external returns (bool) {
        balanceOf[msg.sender] -= _amt;
        unchecked {
            balanceOf[_recipient] += _amt;
        }
        return true;
    }

    receive() external payable {}
}
