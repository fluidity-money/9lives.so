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
        vm.chainId(55244);
        p = new NineLivesPaymaster(address(erc20));
    }

    function testOgous() external {
        emit log_uint(block.chainid);
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
            v: 28,
            r: 0xce9998f2caf2ea6aa710a260fa3fdc62300e1110bdd215411c84bcc458f11d65,
            s: 0x46f7280619c325a7bd719f6f591ee718e47c1000be2ad588b6322c113cbdf090
        });
        (, address recovered) = p.recoverAddressNewChain(operations[0]);
        assertEq(0x63177184B8b5e1229204067a76Ec4c635009CBD2, recovered);
        bool[] memory statuses = p.multicall(operations);
        assert(statuses[0]);
    }
}
