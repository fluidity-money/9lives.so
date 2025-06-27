// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import "forge-std/Script.sol";

import "../tests/TestNineLivesPaymaster.sol";

struct Op {
    bytes32 key;
    uint256 originatingChainId;
    address p;
    address sender;
    address usdc;
    string permitName;
    uint256 permitNonce;
    uint256 permitValue;
    uint256 paymasterNonce;
    uint8 typ;
    address market;
    uint256 amtToSpend;
    address referrer;
    bytes8 outcome;
    uint256 maxFee;
    uint256 chainId;
}

contract ScriptPaymasterSript is Script {
    function setUp() external {}

    function run() public {
        bytes32 key = vm.envBytes32("SPN_SUPERPOSITION_KEY");
        Op memory o = Op({
            key: key,
            originatingChainId: vm.envUint("SPN_ORIGINATING_CHAIN_ID"),
            p: vm.envAddress("SPN_PAYMASTER_ADDR"),
            sender: vm.addr(uint256(key)),
            usdc: vm.envAddress("SPN_FUSDC_ADDR"),
            permitName: vm.envString("SPN_PERMIT_NAME"),
            permitNonce: vm.envUint("SPN_PERMIT_NONCE"),
            permitValue: vm.envUint("SPN_PERMIT_VALUE"),
            paymasterNonce: vm.envUint("SPN_PAYMASTER_NONCE"),
            typ: uint8(vm.envUint("SPN_PAYMASTER_OP")),
            market: vm.envAddress("SPN_PAYMASTER_MARKET"),
            amtToSpend: vm.envUint("SPN_PAYMASTER_AMT"),
            referrer: vm.envAddress("SPN_PAYMASTER_REFERRER"),
            outcome: bytes8(vm.envBytes32("SPN_PAYMASTER_OUTCOME")),
            maxFee: 200000,
            chainId: 55244
        });
        bytes32 permitDomain = keccak256(
            abi.encode(
                keccak256("EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)"),
                keccak256(bytes(o.permitName)),
                keccak256("1"),
                o.chainId,
                o.usdc
            )
        );
        TestNineLivesPaymaster t = new TestNineLivesPaymaster();
        bytes32 paymasterHash = t.computePaymasterSig(
            o.p,
            o.originatingChainId,
            msg.sender,
            o.paymasterNonce,
            o.typ,
            o.market,
            o.maxFee,
            o.amtToSpend,
            0,
            o.referrer,
            o.outcome
        );
        console.log("Hello");
    }
}
