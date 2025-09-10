// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import { Test } from "forge-std/Test.sol";

import {
    NineLivesPaymaster,
    PaymasterType,
    Operation } from "../src/NineLivesPaymaster.sol";

import { CtorArgs } from "../src/INineLivesTrading.sol";
import { IStargate } from "../src/IStargate.sol";
import { ICamelotSwapRouter } from "../src/ICamelotSwapRouter.sol";
import { IWETH10 } from "../src/IWETH10.sol";

import { MockStargate } from "./MockStargate.sol";
import { MockTrading } from "./MockTrading.sol";
import { TestERC20 } from "./TestERC20.sol";
import { MockCamelotSwapRouter } from "./MockCamelotSwapRouter.sol";
import { MockWETH10 } from "./MockWETH10.sol";

contract TestNineLivesPaymaster is Test {
    TestERC20 ERC20;
    ICamelotSwapRouter SWAP_ROUTER;
    IStargate STARGATE;
    IWETH10 WETH;
    NineLivesPaymaster P;
    MockTrading m;

    bytes8 OUTCOME = bytes8(keccak256(abi.encodePacked(uint256(123))));

    function setUp() external {
        ERC20 = new TestERC20();
        vm.chainId(55244);
        P = new NineLivesPaymaster();
        MockWETH10 mockWeth = new MockWETH10();
        WETH = IWETH10(address(mockWeth));
        SWAP_ROUTER = ICamelotSwapRouter(address(new MockCamelotSwapRouter(mockWeth)));
        STARGATE = IStargate(address(new MockStargate()));
        P.initialise(address(ERC20), address(this), STARGATE, SWAP_ROUTER, WETH);
        WETH.deposit{value: 1000e18}();
        WETH.transfer(address(SWAP_ROUTER), 1000e18);
        m = new MockTrading(address(ERC20), address(P));
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

    function computePaymasterHash(
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
        bytes8 outcome,
        uint256 maxOutgoing
    ) public view returns (bytes32 hash) {
        bytes32 domainSeparator = NineLivesPaymaster(payable(p)).computeDomainSeparator(_originatingChain);
        hash = keccak256(
            abi.encodePacked(
                "\x19\x01",
                domainSeparator,
                keccak256(
                    abi.encode(
                        keccak256(
                            "NineLivesPaymaster(address owner,uint256 nonce,uint256 deadline,uint8 typ,address market,uint256 maximumFee,uint256 amountToSpend,uint256 minimumBack,address referrer,bytes8 outcome,uint256 maxOutgoing)"
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
                        outcome,
                        maxOutgoing
                    )
                )
            )
        );
    }

    function testMintEndToEnd() external {
        (address ivan, uint256 ivanPk) = makeAddrAndKey("ivan");
        ERC20.transfer(ivan, 2e6);
        (uint8 permitV, bytes32 permitR, bytes32 permitS) = vm.sign(ivanPk, computePermit(
            address(P),
            ivan,
            0,
            2e6
        ));
        bytes32 hash = computePaymasterHash(
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
            OUTCOME,
            type(uint256).max // Max outgoing
        );
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(ivanPk, hash);
        hash = computePaymasterHash(
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
            OUTCOME,
            type(uint256).max // Max outgoing
        );
        (uint8 v2, bytes32 r2, bytes32 s2) = vm.sign(ivanPk, hash);
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
            s: s,
            outgoingChainEid: 0, // We can set this to zero if we're not using it.
            maxOutgoing: type(uint256).max
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
            s: s2,
            outgoingChainEid: 0,
            maxOutgoing: type(uint256).max
        });
        (,address recovered) = P.recoverAddressNewChain(ops[0]);
        assertEq(ivan, recovered);
        bool[] memory statuses = P.multicall(ops);
        for (uint i = 0; i < statuses.length; ++i) assert(statuses[i]);
    }

    function testBurnEndToEnd() external {
        (address ivan, uint256 ivanPk) = makeAddrAndKey("ivan");
        ERC20.transfer(ivan, 2e6);
        vm.prank(ivan);
        ERC20.approve(address(m), 1e6);
        vm.prank(ivan);
        uint256 minted = m.mint8A059B6E(OUTCOME, 1e6, address(0), ivan);
        bytes32 hash = computePaymasterHash(
            address(P),
            block.chainid,
            ivan,
            0, // Nonce
            uint8(PaymasterType.BURN),
            address(m),
            0, // Max fee
            minted, // Amount to burn
            1e6, // Amount back min
            address(0), // Referrer
            OUTCOME,
            type(uint256).max // Max outgoing
        );
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(ivanPk, hash);
        Operation[] memory ops = new Operation[](1);
        ops[0] = Operation({
            owner: ivan,
            originatingChainId: block.chainid,
            nonce: 0,
            typ: PaymasterType.BURN,
            deadline: type(uint256).max,
            permitAmount: 0,
            permitR: bytes32(0),
            permitS: bytes32(0),
            permitV: 0,
            market: m,
            maximumFee: 0,
            amountToSpend: minted,
            minimumBack: 1e6,
            referrer: address(0),
            outcome: OUTCOME,
            v: v,
            r: r,
            s: s,
            outgoingChainEid: 0,
            maxOutgoing: type(uint256).max
        });
        (,address recovered) = P.recoverAddressNewChain(ops[0]);
        assertEq(ivan, recovered);
        bool[] memory statuses = P.multicall(ops);
        for (uint i = 0; i < statuses.length; ++i) assert(statuses[i]);
    }

    function testAddLiquidityEndToEnd() external {
        (address ivan, uint256 ivanPk) = makeAddrAndKey("ivan");
        ERC20.transfer(ivan, 1e6);
        (uint8 permitV, bytes32 permitR, bytes32 permitS) = vm.sign(ivanPk, computePermit(
            address(P),
            ivan,
            0,
            1e6
        ));
        bytes32 hash = computePaymasterHash(
            address(P),
            block.chainid,
            ivan,
            0, // Nonce
            uint8(PaymasterType.ADD_LIQUIDITY),
            address(m),
            0, // Max fee
            1e6, // Amount to send to add as liquidity
            0, // Amount back min
            address(0), // Referrer
            bytes8(0),
            type(uint256).max // Max outgoing
        );
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(ivanPk, hash);
        Operation[] memory ops = new Operation[](1);
        ops[0] = Operation({
            owner: ivan,
            originatingChainId: block.chainid,
            nonce: 0,
            typ: PaymasterType.ADD_LIQUIDITY,
            deadline: type(uint256).max,
            permitAmount: 1e6,
            permitR: permitR,
            permitS: permitS,
            permitV: permitV,
            market: m,
            maximumFee: 0,
            amountToSpend: 1e6,
            minimumBack: 0,
            referrer: address(0),
            outcome: bytes8(0),
            v: v,
            r: r,
            s: s,
            outgoingChainEid: 0,
            maxOutgoing: type(uint256).max
        });
        (,address recovered) = P.recoverAddressNewChain(ops[0]);
        assertEq(ivan, recovered);
        bool[] memory statuses = P.multicall(ops);
        for (uint i = 0; i < statuses.length; ++i) assert(statuses[i]);
    }

    function testRemoveLiquidityEndToEnd() external {
        (address ivan, uint256 ivanPk) = makeAddrAndKey("ivan");
        ERC20.transfer(ivan, 1e6);
        vm.prank(ivan);
        ERC20.approve(address(m), 1e6);
        vm.prank(ivan);
        uint256 liq = m.addLiquidityB9DDA952(1e6, ivan, 0, type(uint256).max);
        bytes32 hash = computePaymasterHash(
            address(P),
            block.chainid,
            ivan,
            0, // Nonce
            uint8(PaymasterType.REMOVE_LIQUIDITY),
            address(m),
            0, // Max fee
            liq, // Amount to send to add as liquidity
            0, // Amount back min
            address(0), // Referrer
            bytes8(0),
            type(uint256).max // Max outgoing
        );
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(ivanPk, hash);
        Operation[] memory ops = new Operation[](1);
        ops[0] = Operation({
            owner: ivan,
            originatingChainId: block.chainid,
            nonce: 0,
            typ: PaymasterType.REMOVE_LIQUIDITY,
            deadline: type(uint256).max,
            permitAmount: 1e6,
            permitR: bytes32(0),
            permitS: bytes32(0),
            permitV: 0,
            market: m,
            maximumFee: 0,
            amountToSpend: liq,
            minimumBack: 0,
            referrer: address(0),
            outcome: bytes8(0),
            v: v,
            r: r,
            s: s,
            outgoingChainEid: 0,
            maxOutgoing: type(uint256).max
        });
        (,address recovered) = P.recoverAddressNewChain(ops[0]);
        assertEq(ivan, recovered);
        bool[] memory statuses = P.multicall(ops);
        for (uint i = 0; i < statuses.length; ++i) assert(statuses[i]);
        uint256 bal = ERC20.balanceOf(ivan);
        assertEq(1e6, bal);
    }

    function testWithdrawEndToEnd() external {
        (address ivan, uint256 ivanPk) = makeAddrAndKey("ivan");
        ERC20.transfer(ivan, 25000000);
        vm.prank(ivan);
        ERC20.approve(address(P), 25000000);
        bytes32 hash = computePaymasterHash(
            address(P),
            block.chainid,
            ivan,
            0, // Nonce
            uint8(PaymasterType.WITHDRAW_USDC),
            address(m),
            0, // Max fee
            25000000, // Amount to transfer back.
            0, // Amount back min
            address(0), // Referrer
            bytes8(0),
            type(uint256).max // Max outgoing
        );
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(ivanPk, hash);
        Operation[] memory ops = new Operation[](1);
        ops[0] = Operation({
            owner: ivan,
            originatingChainId: block.chainid,
            nonce: 0,
            typ: PaymasterType.WITHDRAW_USDC,
            deadline: type(uint256).max,
            permitAmount: 0,
            permitR: bytes32(0),
            permitS: bytes32(0),
            permitV: 0,
            market: m,
            maximumFee: 0,
            amountToSpend: 25000000,
            minimumBack: 0,
            referrer: address(0),
            outcome: bytes8(0),
            v: v,
            r: r,
            s: s,
            outgoingChainEid: 0,
            maxOutgoing: type(uint256).max
        });
        (,address recovered) = P.recoverAddressNewChain(ops[0]);
        assertEq(ivan, recovered);
        bool[] memory statuses = P.multicall(ops);
        for (uint i = 0; i < statuses.length; ++i) assert(statuses[i]);
    }

    function testWithdrawEndToEnd2() external {
        (address ivan, uint256 ivanPk) = makeAddrAndKey("ivan");
        ERC20.transfer(ivan, 1000000);
        vm.prank(ivan);
        ERC20.approve(address(P), 1000000);
        bytes32 hash = computePaymasterHash(
            address(P),
            42161,
            ivan,
            0, // Nonce
            uint8(PaymasterType.WITHDRAW_USDC),
            address(m),
            0, // Max fee
            1000000, // Amount to transfer back.
            0, // Amount back min
            address(0), // Referrer
            bytes8(0),
            type(uint256).max // Max outgoing
        );
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(ivanPk, hash);
        Operation[] memory ops = new Operation[](1);
        ops[0] = Operation({
            owner: ivan,
            originatingChainId: 42161,
            nonce: 0,
            typ: PaymasterType.WITHDRAW_USDC,
            deadline: type(uint256).max,
            permitAmount: type(uint256).max,
            permitR: bytes32(0),
            permitS: bytes32(0),
            permitV: 0,
            market: m,
            maximumFee: 0,
            amountToSpend: 1000000,
            minimumBack: 0,
            referrer: address(0),
            outcome: bytes8(0),
            v: v,
            r: r,
            s: s,
            outgoingChainEid: 30110,
            maxOutgoing: type(uint256).max
        });
        (,address recovered) = P.recoverAddressNewChain(ops[0]);
        assertEq(ivan, recovered);
        bool[] memory statuses = P.multicall(ops);
        for (uint i = 0; i < statuses.length; ++i) assert(statuses[i]);
    }
}
