// SPDX-Identifier: MIT
pragma solidity 0.8.20;

interface IWETH10 {
    function deposit() external payable;
    function withdraw(uint256) external;

    // ERC20 functions to simplify testing.
    function transfer(address, uint256) external returns (bool);
}
