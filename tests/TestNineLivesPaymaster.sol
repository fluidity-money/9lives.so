// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import "forge-std/Test.sol";

import "../src/NineLivesPaymaster.sol";

import {TestERC20} from "./TestERC20.sol";

contract TestNineLivesPaymaster is Test {
    TestERC20 erc20;
    NineLivesPaymaster p;

    function setUp() external {
        erc20 = new TestERC20();
        p = new NineLivesPaymaster(address(erc20));
    }

    function testOgous() external {
        Operation[] memory operations = new Operation[](1);
        assertEq(
            0x83e46451d84d0dee47dc069730514d369f8cccfecdb0852ecd036d7aa3ee5476,
            keccak256(abi.encode(55244))
        );
        operations[0] = Operation({
            owner: 0x63177184B8b5e1229204067a76Ec4c635009CBD2,
            originatingChainId: 55244,
            nonce: 0,
            deadline: 1750418163,
            typ: PaymasterType.MINT,
            permitR: bytes32(0),
            permitS: bytes32(0),
            permitV: 0,
            market: INineLivesTrading(0x2Ef8FE80F525BfeCA66Cd16Bd9e8af5556f40b11),
            maximumFee: 0,
            amountToSpend: 1000000,
            minimumBack: 0,
            referrer: 0x0000000000000000000000000000000000000000,
            outcome: 0x3757cf75e4508cae,
            v: 27,
            r: 0xba2bdbb7648b4c2f26263af9507936debca5cf85901d7c6778fbdca89492c9d7,
            s: 0x2c9a0d07c57371a4feb379deba6236623367c27729e647f184ffbed27070e903
        });
        (, address recovered) = p.recoverAddressNewChain(operations[0]);
        assertEq(0x63177184B8b5e1229204067a76Ec4c635009CBD2, recovered);
        bool[] memory statuses = p.multicall(operations);
        assert(statuses[0]);
    }
}
