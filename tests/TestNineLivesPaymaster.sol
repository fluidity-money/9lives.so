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
        operations[0] = Operation({
            owner: 0x63177184B8b5e1229204067a76Ec4c635009CBD2,
            originatingChainId: 55244,
            nonce: 0,
            deadline: 1750412817,
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
            r: 0x298d2297b796283f229aaafe064b97554bdffbab812864bcba5707e96a5b3046,
            s: 0x10ec9e3dd0dfc8a701244ab357627b5d8c40b0943a3978eb927f98465133fe40
        });
        bool[] memory statuses = p.multicall(operations);
        assert(statuses[0]);
    }
}
