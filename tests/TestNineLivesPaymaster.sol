// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import "forge-std/Test.sol";

import "../src/NineLivesPaymaster.sol";

import {MockTrading} from "./MockTrading.sol";
import {TestERC20} from "./TestERC20.sol";

contract TestNineLivesPaymaster is Test {
    TestERC20 ERC20;
    NineLivesPaymaster P;
    MockTrading m;

    bytes8 OUTCOME = bytes8(keccak256(abi.encodePacked(uint256(123))));

    function setUp() external {
        ERC20 = new TestERC20();
        vm.chainId(55244);
        P = new NineLivesPaymaster(address(ERC20));
        m = new MockTrading(address(ERC20));
        bytes8[] memory outcomes = new bytes8[](2);
        outcomes[0] = OUTCOME;
        outcomes[1] = bytes8(keccak256(abi.encodePacked(block.timestamp)));
        m.ctor(CtorArgs({
            outcomes: outcomes,
            oracle: address(0),
            timeStart: 0,
            timeEnding: type(uint64).max,
            feeRecipient: address(0),
            shareImpl: address(0),
            shouldBufferTime: false,
            feeCreator: 0,
            feeMinter: 0,
            feeLp: 0,
            feeReferrer: 0
        }));
    }

    function computePermit(
        address p,
        address sender,
        uint256 nonce,
        uint256 value
    ) public view returns (bytes32 hash) {
        bytes32 domainSeparator = ERC20.DOMAIN_SEPARATOR();
        hash = keccak256(
            abi.encodePacked(
                "\x19\x01",
                domainSeparator,
                keccak256(
                    abi.encode(
                        keccak256(
                            "Permit(address owner,address spender,uint256 value,uint256 nonce,uint256 deadline)"
                        ),
                        sender,
                        p,
                        value,
                        nonce,
                        type(uint256).max
                    )
                )
            )
        );
    }

    function computePaymasterSig(
        address p,
        uint256 _originatingChain,
        address sender,
        uint256 nonce,
        uint8 typ,
        address market,
        uint256 maxFee,
        uint256 amtToSpend,
        uint256 minBack,
        address ref,
        bytes8 outcome
    ) public view returns (bytes32 hash) {
        bytes32 domainSeparator = NineLivesPaymaster(p).computeDomainSeparator(_originatingChain);
        hash = keccak256(
            abi.encodePacked(
                "\x19\x01",
                domainSeparator,
                keccak256(
                    abi.encode(
                        keccak256(
                            "NineLivesPaymaster(address owner,uint256 nonce,uint256 deadline,uint8 typ,address market,uint256 maximumFee,uint256 amountToSpend,uint256 minimumBack,address referrer,bytes8 outcome)"
                        ),
                        sender,
                        nonce,
                        type(uint256).max,
                        typ,
                        market,
                        maxFee,
                        amtToSpend,
                        minBack,
                        ref,
                        outcome
                    )
                )
            )
        );
    }

    function testEndToEnd() external {
        (address ivan, uint256 ivanPk) = makeAddrAndKey("ivan");
        ERC20.transfer(ivan, 2e6);
        (uint8 permitV, bytes32 permitR, bytes32 permitS) = vm.sign(ivanPk, computePermit(
            address(P),
            ivan,
            0,
            2e6
        ));
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(ivanPk, computePaymasterSig(
            address(P),
            block.chainid,
            ivan,
            0, // Nonce
            uint8(PaymasterType.MINT),
            address(m),
            0, // Max fee (no stack)
            1e6, // Amount to spend (no stack)
            0,
            address(0), // Refererr (no stack)
            OUTCOME
        ));
        (uint8 v2, bytes32 r2, bytes32 s2) = vm.sign(ivanPk, computePaymasterSig(
            address(P),
            block.chainid,
            ivan,
            1, // Nonce
            uint8(PaymasterType.MINT),
            address(m),
            0, // Max fee (no stack)
            1e6, // Amount to spend (no stack)
            0,
            address(0), // Refererr (no stack)
            OUTCOME
        ));
        Operation[] memory ops = new Operation[](2);
        ops[0] = Operation({
            owner: ivan,
            originatingChainId: block.chainid,
            nonce: 0,
            typ: PaymasterType.MINT,
            deadline: type(uint256).max,
            permitAmount: 2e6,
            permitR: permitR,
            permitS: permitS,
            permitV: permitV,
            market: m,
            maximumFee: 0,
            amountToSpend: 1e6,
            minimumBack: 0,
            referrer: address(0),
            outcome: OUTCOME,
            v: v,
            r: r,
            s: s
        });
        ops[1] = Operation({
            owner: ivan,
            originatingChainId: block.chainid,
            nonce: 1,
            typ: PaymasterType.MINT,
            deadline: type(uint256).max,
            permitAmount: 0,
            permitR: bytes32(0),
            permitS: bytes32(0),
            permitV: 0,
            market: m,
            maximumFee: 0,
            amountToSpend: 1e6,
            minimumBack: 0,
            referrer: address(0),
            outcome: OUTCOME,
            v: v2,
            r: r2,
            s: s2
        });
        (,address recovered) = P.recoverAddressNewChain(ops[0]);
        assertEq(ivan, recovered);
        bool[] memory statuses = P.multicall(ops);
        for (uint i = 0; i < statuses.length; ++i) assert(statuses[i]);
    }
}
