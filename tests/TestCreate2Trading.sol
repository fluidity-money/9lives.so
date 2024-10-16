// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "forge-std/Test.sol";
import "forge-std/console.sol";

// Simple testing code to validate that our CREATE2 approach for creating
// Trading contracts and the offline derivation after.

contract TestCreate2Trading is Test {
    bytes TRADING_CREATE_BYTECODE = hex"61009c61000f60003961009c6000f33461009857600160023611156100985760016080526001600260a03760806020810151815160200360031b1c90501861005257730000000000000000000000000000000000000000604052610072610074565b730000000000000000000000000000000000000000604052610072610074565b005b6040515a595f5f36365f8537838686f4905090509050610096573d5f5f3e3d5ffd5b565b5f80fd84189c8000a1657679706572830004000012";
    bytes8 OUTCOME_1 = 0x290ba3d293b129ab;
    bytes8 OUTCOME_2 = 0x6f2af2188bfb19ca;
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
