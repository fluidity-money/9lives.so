// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

// Helper contract to simplify obtaining a commitment (and also to show
// how to do so in Solidity).
contract TestPredictionHasher {
    function hash(address a, bytes8 o, uint256 s) external pure returns (bytes32) {
        return keccak256(abi.encodePacked(a, o, s));
    }
}
