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
    bytes32 TRADING_ID = keccak256(abi.encodePacked(OUTCOME_1, OUTCOME_2));
    function testCreate2Create() public {
        bytes memory tradingCreateBytecode = TRADING_CREATE_BYTECODE;
        console.log("Address of this contract:");
        console.log(address(this));
        bytes32 salt = bytes32(TRADING_ID);
        console.log("Creation salt:");
        console.logBytes32(salt);
        console.log("Creation bytecode (hashed):");
        console.logBytes32(keccak256(tradingCreateBytecode));
        console.logBytes(tradingCreateBytecode);
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
}
