// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import "forge-std/Test.sol";

import "../src/NineLivesPaymaster.sol";

import {MockTrading} from "./MockTrading.sol";
import {TestERC20} from "./TestERC20.sol";

contract TestNineLivesPaymaster is Test {
    TestERC20 erc20;
    TestERC20 shareAddr;
    NineLivesPaymaster p;
    MockTrading m;

    function setUp() external {
        erc20 = new TestERC20();
        shareAddr = new TestERC20();
        vm.chainId(55244);
        p = new NineLivesPaymaster(address(erc20));
        m = new MockTrading(address(erc20), address(shareAddr));
    }

    function computePermit(uint256 nonce, uint256 value) internal view returns (bytes32 hash) {
        bytes32 domainSeparator = erc20.DOMAIN_SEPARATOR();
        hash = keccak256(
            abi.encodePacked(
                "\x19\x01",
                domainSeparator,
                keccak256(
                    abi.encode(
                        keccak256(
                            "Permit(address owner,address spender,uint256 value,uint256 nonce,uint256 deadline)"
                        ),
                        msg.sender,
                        address(p),
                        value,
                        nonce,
                        type(uint256).max
                    )
                )
            )
        );
    }

    function computePaymasterSig(
        uint256 nonce,
        uint8 typ,
        address market,
        uint256 maxFee,
        uint256 amtToSpend,
        uint256 minBack,
        address ref,
        bytes8 outcome
    ) internal view returns (bytes32 hash) {
        bytes32 domainSeparator = p.computeDomainSeparator(block.chainid);
        hash = keccak256(
            abi.encodePacked(
                "\x19\x01",
                domainSeparator,
                keccak256(
                    abi.encode(
                        keccak256(
                            "NineLivesPaymaster(address owner,uint256 nonce,uint256 deadline,uint8 typ,address market,uint256 maximumFee,uint256 amountToSpend,uint256 minimumBack,address referrer,bytes8 outcome)"
                        ),
                        msg.sender,
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
        vm.prank(ivan);
        PaymasterType typ = PaymasterType.MINT;
        (uint8 permitV, bytes32 permitR, bytes32 permitS) = vm.sign(ivanPk, computePermit(0, 1e6));
        bytes8 outcome = bytes8(keccak256(abi.encodePacked(block.timestamp)));
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(ivanPk, computePaymasterSig(
            0,
            uint8(typ),
            address(m),
            0, // Max fee (no stack)
            1e6, // Amount to spend (no stack)
            0,
            address(0), // Refererr (no stack)
            outcome
        ));
        Operation[] memory ops = new Operation[](1);
        ops[0] = Operation({
            owner: msg.sender,
            originatingChainId: block.chainid,
            nonce: 0,
            typ: typ,
            deadline: type(uint256).max,
            permitR: permitR,
            permitS: permitS,
            permitV: permitV,
            market: m,
            maximumFee: 0,
            amountToSpend: 1e6,
            minimumBack: 0,
            referrer: address(0),
            outcome: outcome,
            v: v,
            r: r,
            s: s
        });
        bool[] memory statuses = p.multicall(ops);
        assert(statuses[0]);
    }
}
