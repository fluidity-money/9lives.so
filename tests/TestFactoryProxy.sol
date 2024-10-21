// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "forge-std/Test.sol";

import "../src/FactoryProxy.sol";

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

contract MockImpl1_2 {
    function swagC82F43C4() external pure returns (uint256) {
        return 2;
    }
}

contract MockImpl2_2 {
    uint256 count;
    function migration(uint256 _newCount) external {
        count = _newCount;
    }
    function yolo() external view returns (uint256) {
        return count;
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

contract TestFactoryProxy is Test {
    IMockedFactory factoryProxy;

    function setUp() external {
        factoryProxy = IMockedFactory(address(new FactoryProxy(
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
            bytes32(uint256(keccak256('eip1967.proxy.implementation')) - 1)
        )))));
        proxyAdmin.upgrade(
            address(factoryProxy),
            address(new MockImpl1_2()),
            address(new MockImpl2_2()),
            abi.encodeWithSelector(MockImpl2_2.migration.selector, 123)
        );
        assertEq(factoryProxy.swagC82F43C4(), 2);
        assertEq(factoryProxy.yolo(), 123);
    }
}
