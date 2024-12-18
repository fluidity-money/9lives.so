// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "forge-std/Test.sol";
import "forge-std/console.sol";

import "../src/Share.sol";

contract TestShare is Test {
    bytes PROXY_BYTECODE = hex"60208038033d393d517f360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc55603e8060343d393df3363d3d373d3d363d7f360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc545af43d6000803e610039573d6000fd5b3d6000f3";

    Share share;

    function setUp() public {
        address shareImpl = address(new Share());
        bytes memory proxyBytecode = abi.encodePacked(PROXY_BYTECODE, shareImpl);
        address share_;
        assembly {
            share_ := create(0, add(proxyBytecode, 32), mload(proxyBytecode))
        }
        share = Share(share_);
        share.ctor("Hello", address(this));
    }

    function testSymbol() public view {
        assertEq(share.symbol(), "9#482975526718864155");
    }

    function testName() public view {
        assertEq(share.name(), "9lives #246 Hello");
    }
}
