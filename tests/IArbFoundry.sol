// SPDX-License-Identifier: MIT
pragma solidity 0.8.30;

interface IArbFoundry {
    function deployStylusCode(string calldata artifactPath) external returns (address deployedAddress);
    function deployStylusCode(string calldata artifactPath, bytes calldata constructorArgs) external returns (address deployedAddress);
    function deployStylusCode(string calldata artifactPath, uint256 value) external returns (address deployedAddress);
    function deployStylusCode(string calldata artifactPath, bytes calldata constructorArgs, uint256 value) external returns (address deployedAddress);
    function deployStylusCode(string calldata artifactPath, bytes32 salt) external returns (address deployedAddress);
    function deployStylusCode(string calldata artifactPath, bytes calldata constructorArgs, bytes32 salt) external returns (address deployedAddress);
    function deployStylusCode(string calldata artifactPath, uint256 value, bytes32 salt) external returns (address deployedAddress);
    function deployStylusCode(string calldata artifactPath, bytes calldata constructorArgs, uint256 value, bytes32 salt) external returns (address deployedAddress);
}
