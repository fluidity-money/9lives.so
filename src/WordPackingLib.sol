// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

library WordPackingLib {
    function pack(
        bytes8 word1,
        bytes8 word2,
        bytes8 word3,
        bytes8 word4
    ) external pure returns (bytes32 word) {
        word |= bytes32(word1);
        word |= bytes32(word2) >> 64;
        word |= bytes32(word3) >> 128;
        word |= bytes32(word4) >> 192;
    }

    function unpack(bytes32 word) external pure returns (
        bytes8,
        bytes8,
        bytes8,
        bytes8
    ) {
        return (
            bytes8(word),
            bytes8(word << 64),
            bytes8(word << 128),
            bytes8(word << 192)
        );
    }
}

