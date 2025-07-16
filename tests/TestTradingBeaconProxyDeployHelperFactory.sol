// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import { Test } from "forge-std/Test.sol";

import { TradingBeacon } from "../src/TradingBeacon.sol";
import { TradingBeaconProxyDeployHelperFactory } from "../src/TradingBeaconProxyDeployHelperFactory.sol";
import { TradingBeaconProxy } from "../src/TradingBeaconProxy.sol";

contract TestLocation1 {
    function printC8657AC3() external pure returns (bool) {
        return true;
    }
}

contract TestLocation1Alt {
    function printC8657AC3() external pure returns (bool) {
        return false;
    }
}

contract TestLocation2 {
    function print0D81DE33() external pure returns (bool) {
        return true;
    }
}

contract TestLocation3 {
    function printF592E6FC() external pure returns (bool) {
        return true;
    }
}

contract TestLocation4 {
    function swag() external pure returns (bool) {
        return true;
    }

    function ctor(
        bytes8[] memory /* outcomes */,
        address /* _oracle */,
        uint64 /* _timeStart */,
        uint64 /* _timeEnding */,
        address /* _feeRecipient */,
        address /* _shareImpl */,
        bool /* _shouldExtend */,
        uint64 /* _feeCreator */,
        uint64 /* _feeMinter */,
        uint64 /* _feeLp */
    ) external {
        // Do nothing here.
    }
}

contract TestTradingBeaconProxyDeployHelperFactory is Test {
    TestLocation1 print1;
    TestLocation2 print2;
    TestLocation3 print3;
    TestLocation4 print4;
    TradingBeaconProxyDeployHelperFactory t;
    TradingBeaconProxy p;

    function setUp() external {
        print1 = new TestLocation1();
        print2 = new TestLocation2();
        print3 = new TestLocation3();
        print4 = new TestLocation4();
        t = new TradingBeaconProxyDeployHelperFactory(
            address(this), // Admin address
            address(print1),
            address(print2),
            address(print3),
            address(print4)
        );
        // For our testing, the code that lives underneath is the contract here.
        TradingBeaconProxyDeployHelperFactory.CreateArgs memory a;
        p = TradingBeaconProxy(address(t.create(a)));
    }

    function testBeacon() external view {
        assertEq(address(print1), t.BEACON().mint());
        assertEq(address(print2), t.BEACON().quotes());
        assertEq(address(print3), t.BEACON().price());
        assertEq(address(print4), t.BEACON().extras());
    }

    function testCopyingIsCorrectAndUpgradeSafe() external {
        p.indicateProxy();
        assertGt(address(p).code.length, 0);
        assert(TestLocation1(address(p)).printC8657AC3());
        assert(TestLocation2(address(p)).print0D81DE33());
        assert(TestLocation3(address(p)).printF592E6FC());
        assert(TestLocation4(address(p)).swag());
        TradingBeacon(address(t.BEACON())).upgradeMint(
            address(print1),
            address(new TestLocation1Alt())
        );
        assert(!TestLocation1(address(p)).printC8657AC3());
    }
}
