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
            0x26c662acf98b6b601d5714f8017fe563ab1ca7b9d5addc096768ef28aaaab5f4,
            keccak256(abi.encode(55244))
        );
        operations[0] = Operation({
            owner: 0x63177184B8b5e1229204067a76Ec4c635009CBD2,
            originatingChainId: 55244,
            nonce: 0,
            deadline: 1750414770,
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
            r: 0xab01510387a7f420f3aa2579595db7d186a71f6506f671cb3196f97015c8c247,
            s: 0x10b636078654606736a84c64453eb834a1599052295f642fdcc23bdd55bdded6
        });
        (, address recovered) = p.recoverAddressNewChain(operations[0]);
        assertEq(0x63177184B8b5e1229204067a76Ec4c635009CBD2, recovered);
        bool[] memory statuses = p.multicall(operations);
        assert(statuses[0]);
    }
}
