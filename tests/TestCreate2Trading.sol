// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "forge-std/Test.sol";
import "forge-std/console.sol";

// Simple testing code to validate that our CREATE2 approach for creating
// Trading contracts and the offline derivation after.

contract TestCreate2Trading is Test {
    bytes TRADING_CREATE_BYTECODE = hex"60208038033d393d517f360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc55603e8060343d393df3363d3d373d3d363d7f360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc545af43d6000803e610039573d6000fd5b3d6000f3feb6034fc7df27df18a3a6bad5fb94c0d3dcb6d5";
    bytes8 OUTCOME_1 = 0x1234123412341234;
    bytes8 OUTCOME_2 = 0x2234123412341234;
    function testCreate2Create() public {
        bytes memory tradingCreateBytecode = TRADING_CREATE_BYTECODE;
        bytes8 outcome1 = OUTCOME_1;
        bytes8 outcome2 = OUTCOME_2;
        console.log("Address of this contract:");
        console.log(address(this));
        bytes8 outcome_id = bytes8(keccak256(abi.encodePacked(outcome1, outcome2)));
        bytes32 salt = bytes32(outcome_id);
        console.log("Creation salt:");
        console.logBytes32(salt);
        console.log("Creation bytecode:");
        console.logBytes32(keccak256(tradingCreateBytecode));
        address addr;
        assembly {
            addr := create2(
                0,
                add(tradingCreateBytecode, 32),
                mload(tradingCreateBytecode),
                salt
            )
        }
        console.log("End result from CREATE2:");
        console.log(addr);
    }

    function testCreate2Verify() public view {
        console.log("Verification test factory address:");
        address factory = 0x7FA9385bE102ac3EAc297483Dd6233D62b3e1496;
        console.log(factory);
        bytes8 outcome_id = bytes8(keccak256(abi.encodePacked(OUTCOME_1, OUTCOME_2)));
        console.log("Outcome id:");
        console.logBytes8(outcome_id);
        bytes32 salt = bytes32(outcome_id);
        console.log("Salt:");
        console.logBytes(abi.encodePacked(
            hex"ff",
            factory,
            salt,
            keccak256(TRADING_CREATE_BYTECODE)
        ));
        console.log("Address of CREATE2:");
        console.log(address(uint160(uint(keccak256(abi.encodePacked(
            hex"ff",
            factory,
            salt,
            keccak256(TRADING_CREATE_BYTECODE)
        ))))));
    }
}