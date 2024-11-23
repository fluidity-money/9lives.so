// SPDX-Identifier: MIT
pragma solidity 0.8.18;

interface IOracle {
    function call(bytes8 winner) external;
    function wasCalled() external view returns (bytes8 winner);
}
