// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "forge-std/Test.sol";
import "forge-std/console.sol";

import "./MockLongtail.sol";
import "./MockFactory.sol";

import "../src/LensesV1.sol";

contract TestShare is Test {
    MockLongtail longtail;
    INineLivesFactory factory;
    LensesV1 lenses;

    function setUp() public {
        longtail = new MockLongtail();
        factory = INineLivesFactory(new MockFactory());
        lenses = new LensesV1(ILongtail(address(longtail)), factory);
    }

    function testQuote() public view {
        assertEq("1000", lenses.getLongtailQuote(address(this), true, 0, 0));
    }
}
