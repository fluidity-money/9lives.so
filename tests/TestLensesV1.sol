// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "forge-std/Test.sol";

import "./MockLongtail.sol";
import "./MockFactory.sol";
import "./MockLensesV1.sol";

import {LensesV1} from "../src/LensesV1.sol";
import {ILongtail} from "../src/ILongtail.sol";

contract TestShare is Test {
    MockLongtail longtail;
    INineLivesFactory factory;
    LensesV1 lenses;
    MockLensesV1 mockLenses;

    function setUp() public {
        longtail = new MockLongtail();
        factory = INineLivesFactory(new MockFactory(address(0), address(1)));
        lenses = new LensesV1(ILongtail(address(longtail)), factory);
        mockLenses = new MockLensesV1();
    }

    function testQuote() public {
        string memory amt = lenses.getLongtailQuote(address(this), true, 0, 0);
        assertEq("430201822", amt);
    }

    function testLenses() public view {
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

    function testGetShareAddrAndCall() public view {
        // Assumes factory is deployed at 0x2e234dae75c793f67a35089c9d99245e1c58470b
        address trading = 0x0202020202020202020202020202020202020202;
        address eTrading1 = 0xd268387eC71089B12c46135705945364893d4825;
        address eTrading2 = 0xF361dd38da58a587c92160b3F1173db31DfF2C94;
        address eTrading3 = 0x104075d59d7623B9f1B5F47d673c4A7584921594;
        address eTrading4 = 0xa046976f03522C9c1390b029c02f767Af14c3164;
        // Use the default factory, so set this to 0.
        INineLivesFactory f = INineLivesFactory(address(0));
        assertEq(eTrading1, lenses.getShareAddr(f, trading, 0x0101010101010101));
        assertEq(eTrading2, lenses.getShareAddr(f, trading, 0x0202020202020202));
        assertEq(eTrading3, lenses.getShareAddr(f, trading, 0x0303030303030303));
        assertEq(eTrading4, lenses.getShareAddr(f, trading, 0x0404040404040404));
    }
}
