// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import { Test } from "forge-std/Test.sol";

import { UpgradeableTwoProxy } from "../src/UpgradeableTwoProxy.sol";

contract MockImpl1_1 {
    uint256[50] __empty;
    uint256 amount;
    function swagC82F43C4() external view returns (uint256) {
        return amount;
    }
}

contract MockImpl2_1 {
    uint256[50] __empty;
    uint256 amount_;
    function dog(uint256 _seed) external {
        amount_ = _seed;
    }
    function yolo() external pure returns (uint256) {
        return 2;
    }
}

struct FactoryOutcome {
    bytes8 identifier;
    uint256 seed;
    string name;
}

contract MockImpl1_2 {
    uint256[50] __empty;
    uint256 count;
    function swagC82F43C4() external pure returns (uint256) {
        return 2;
    }
    function newTrading09393DA8(
        FactoryOutcome[] memory /* _outcomes */,
        address /* _oracle */,
        uint64 /* _timeStart */,
        uint64 /* _timeEnding */,
        bytes32 /* _documentation */,
        address /* _feeRecipient */
    ) external view returns (uint256) {
        return count;
    }
}

contract MockImpl2_2 {
    uint256 count;
    function migration(uint256 _newCount) external {
        count = _newCount;
    }
}

interface IMockedFactory {
    function upgradeAndCall(address,address,bytes memory) external;
    function swagC82F43C4() external pure returns (uint256);
    function yolo() external pure returns (uint256);
}

interface IProxyAdmin {
    function upgrade(address, address, address, bytes memory) external;
}

contract TestUpgradeableTwoProxy is Test {
    IMockedFactory factoryProxy;

    function setUp() external {
        factoryProxy = IMockedFactory(address(new UpgradeableTwoProxy(
            address(this),
            address(new MockImpl1_1()),
            address(new MockImpl2_1()),
            abi.encodeWithSelector(MockImpl2_1.dog.selector, 9999)
        )));
    }

    function testDelegatesOk() external view {
        assertEq(factoryProxy.swagC82F43C4(), 9999);
        assertEq(factoryProxy.yolo(), 2);
    }

    function testDelegatesOkAfterUpgrade() external {
        IProxyAdmin proxyAdmin = IProxyAdmin(address(uint160(uint256(vm.load(
            address(factoryProxy),
            bytes32(uint256(keccak256('eip1967.proxy.admin')) - 1)
        )))));
        proxyAdmin.upgrade(
            address(factoryProxy),
            address(new MockImpl1_2()),
            address(new MockImpl2_2()),
            abi.encodeWithSelector(MockImpl2_2.migration.selector, 123)
        );
        FactoryOutcome[] memory o;
        assertEq(MockImpl1_2(address(factoryProxy)).newTrading09393DA8(
            o,
            address(0),
            0,
            0,
            bytes32(0),
            address(0)
        ), 9999);
    }
}
