// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import { WordPackingLib } from "../src/WordPackingLib.sol";

contract MockLensesV1 {
    using WordPackingLib for bytes32;

    function pack(
        bytes8 word1,
        bytes8 word2,
        bytes8 word3,
        bytes8 word4
    ) external pure returns (bytes32) {
        return WordPackingLib.pack(word1, word2, word3, word4);
    }

    function unpack(bytes32 word) external pure returns (
        bytes8,
        bytes8,
        bytes8,
        bytes8
    ) {
        return WordPackingLib.unpack(word);
    }
}
