// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "forge-std/Test.sol";
import "forge-std/console.sol";

// Simple testing code to validate that our CREATE2 approach for creating
// Trading contracts and the offline derivation after.

contract TestCreate2Trading is Test {
    bytes TRADING_CREATE_BYTECODE = hex"602d5f8160095f39f35f5f365f5f37365f7300000000000000000000000000000000000000005af43d5f5f3e6029573d5ffd5b3d5ff3";
    bytes8 OUTCOME_1 = 0x3b79565a915eb950;
    bytes8 OUTCOME_2 = 0x8f885992cafd4d5c;
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
        console.log("Creation bytecode (hashed):");
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
        console.log("Salt:");
        bytes32 salt = bytes32(outcome_id);
        console.logBytes32(salt);
        console.log("Preimage:");
        bytes memory preimage = abi.encodePacked(
            hex"ff",
            factory,
            salt,
            keccak256(TRADING_CREATE_BYTECODE)
        );
        console.logBytes(preimage);
        console.log("Address of CREATE2:");
        console.log(address(uint160(uint(keccak256(preimage)))));
    }
}
