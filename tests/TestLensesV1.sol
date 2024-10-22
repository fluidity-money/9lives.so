// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "forge-std/Test.sol";

import "./MockLongtail.sol";
import "./MockFactory.sol";
import "./MockLensesV1.sol";

import "../src/LensesV1.sol";

contract TestShare is Test {
    MockLongtail longtail;
    INineLivesFactory factory;
    LensesV1 lenses;
    MockLensesV1 mockLenses;

    function setUp() public {
        longtail = new MockLongtail();
        factory = INineLivesFactory(new MockFactory());
        lenses = new LensesV1(ILongtail(address(longtail)), factory);
        mockLenses = new MockLensesV1();
    }

    function testQuote() public {
        string memory amt = lenses.getLongtailQuote(address(this), true, 0, 0);
        assertEq("430201822", amt);
    }

    function testLenses() public {
        bytes8 eWord1 = bytes8(keccak256(abi.encodePacked(block.timestamp)));
        bytes8 eWord2 = bytes8(keccak256(abi.encodePacked(block.timestamp + 1)));
        bytes8 eWord3 = bytes8(keccak256(abi.encodePacked(block.timestamp + 2)));
        bytes8 eWord4 = bytes8(keccak256(abi.encodePacked(block.timestamp + 3)));
        (
            bytes8 word1,
            bytes8 word2,
            bytes8 word3,
            bytes8 word4
        ) = mockLenses.unpack(mockLenses.pack(eWord1, eWord2, eWord3, eWord4));
        assertEq(eWord1, word1);
        assertEq(eWord2, word2);
        assertEq(eWord3, word3);
        assertEq(eWord4, word4);
    }
}
