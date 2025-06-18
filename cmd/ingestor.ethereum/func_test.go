package main

import (
	"encoding/json"
	"strings"
	"testing"

	"github.com/fluidity-money/9lives.so/lib/types/events"

	"github.com/stretchr/testify/assert"

	ethCommon "github.com/ethereum/go-ethereum/common"
	ethTypes "github.com/ethereum/go-ethereum/core/types"
)

func TestTopicsAreOkay(t *testing.T) {
	var z [32]byte
	assert.NotContains(t, z[:], FilterTopics)
}

func TestSharesMinted(t *testing.T) {
	s := strings.NewReader(`{

	"address": "0xc0393bb76c72378eb59ae5690c71efb62a420921",
	"blockHash": "0xf26f344ba9dae977f41b158cac2bc0cbb3735104b3ddd0c95dc4b10704a33bd6",
	"blockNumber": "0x10257f68",
	"data": "0x0000000000000000000000007bf28d75b4179dd6a0000c66f6b2c0502efd0b780000000000000000000000000000000000000000000000000000000001312d00",
	"logIndex": "0x5",
	"removed": false,
	"topics": [
		"0x67c2067005f9aaa672cf0d349c477d4d5e9d7578bca4789a839f84c669fe0b31",
		"0x1b8fb68f7c2e19b8000000000000000000000000000000000000000000000000",
		"0x00000000000000000000000000000000000000000000000000000000028511e1",
		"0x0000000000000000000000007bf28d75b4179dd6a0000c66f6b2c0502efd0b78"
	],
	"transactionHash": "0x5bb7f89dee759331faccf4af48a2295bce9040dcc283dc51d099b9ba294860dd",
	"transactionIndex": "0x2"
}`)
	var l ethTypes.Log
	assert.Nilf(t, json.NewDecoder(s).Decode(&l), "failed to decode log")
	wasRun := false
	factoryAddr := ethCommon.HexToAddress("0x0000000000000000000000000000000000000000")

	handleLogCallback(
		factoryAddr,
		factoryAddr, // Actually the infra market
		factoryAddr, // Actually the lockup
		factoryAddr, // Actually SARP's on-chain signaller.
		factoryAddr, // Actually Lifi's diamond.
		l,
		func(blockHash, txHash, addr string) error {
			return nil // Unused for this test.
		},
		func(addr string) (bool, error) {
			return addr == "0xc0393bb76c72378eb59ae5690c71efb62a420921", nil
		},
		func(table string, a any) error {
			assert.Equalf(t, "ninelives_events_shares_minted", table, "table not equal")
			_, ok := a.(*events.EventSharesMinted)
			assert.Truef(t, ok, "SharesMinted type coercion not true")
			wasRun = true
			return nil
		})
	assert.True(t, wasRun)
}

func TestOutcomeDecided(t *testing.T) {
	s := strings.NewReader(`{
	"address": "0xc515931083dda1edba5bb4e0555b83c7a84a22c7",
	"blockHash": "0x4c59198fc91af68c6663bf96b8f4d72a95ca2360c5da0beb6aad7b092de2c47e",
	"blockNumber": "0xf28b9",
	"data": "0x",
	"logIndex": "0x0",
	"removed": false,
	"topics": [
		"0x346cb28308c5aa92dbbc3370b3e3f02f23b4feb3ed394ac97cdf989c092ba46c",
		"0x6d53a60a1a325a2f000000000000000000000000000000000000000000000000",
		"0x0000000000000000000000009d73847f1edc930d2a2ee801aeadb4c4567f18e1"
	],
	"transactionHash": "0xc0fe3856a3e5c2c1ab1920139a63c71c1f1ea7639e86f1d87721d3d6246a9581",
	"transactionIndex": "0x1"
}`)
	var l ethTypes.Log
	assert.Nilf(t, json.NewDecoder(s).Decode(&l), "failed to decode log")
	wasRun := false
	factoryAddr := ethCommon.HexToAddress("0x0000000000000000000000000000000000000000")

	_, err := handleLogCallback(
		factoryAddr,
		factoryAddr, // Actually the infra market
		factoryAddr, // Actually the lockup
		factoryAddr, // Actually SARP's on-chain signaller.
		factoryAddr, // Actually Lifi's diamond.
		l,
		func(blockHash, txHash, addr string) error {
			return nil // Unused for this test.
		},
		func(addr string) (bool, error) {
			return true, nil
		},
		func(table string, a any) error {
			assert.Equalf(t, "ninelives_events_outcome_decided", table, "table not equal")
			_, ok := a.(*events.EventOutcomeDecided)
			assert.Truef(t, ok, "EventOutcomeDecided type coercion not true")
			wasRun = true
			return nil
		},
	)
	assert.NoError(t, err)
	assert.True(t, wasRun)
}

func TestLifiGenericSwapCompleted(t *testing.T) {
	s := strings.NewReader(`{
	"address": "0x03d55a7896097801b1de90b4e3e0392ce279180a",
	"blockHash": "0xcbb276f172e0d4b444e829fabc14c57a92b12d88ad5dd7e8d3dfafa4bab9ff61",
	"blockNumber": "0x19e451",
	"data": "0x00000000000000000000000000000000000000000000000000000000000000e000000000000000000000000000000000000000000000000000000000000001200000000000000000000000006221a9c005f6e47eb398fd867784cacfdcfff4e700000000000000000000000000000000000000000000000000000000000000000000000000000000000000006c030c5cc283f791b26816f325b9c632d964f8a100000000000000000000000000000000000000000000000000352b7d97161ad80000000000000000000000000000000000000000000000000000000002371da7000000000000000000000000000000000000000000000000000000000000000e6e6578746a732d6578616d706c65000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000002a30783030303030303030303030303030303030303030303030303030303030303030303030303030303000000000000000000000000000000000000000000000",
	"logIndex": "0x9",
	"removed": false,
	"topics": [
		"0x38eee76fd911eabac79da7af16053e809be0e12c8637f156e77e1af309b99537",
		"0xe2ae770feb1e1259be2202f1f786013e6349604de44cb9cbbc0dab7184a1061d"
	],
	"transactionHash": "0x54607f676bf0f1fa47cadec765113cf89dc3664fa7416bfbc8ed08fac19f2a31",
	"transactionIndex": "0x1"
}`)
	var l ethTypes.Log
	assert.Nilf(t, json.NewDecoder(s).Decode(&l), "failed to decode log")
	wasRun := false
	factoryAddr := ethCommon.HexToAddress("0x0000000000000000000000000000000000000000")
	lifiDiamond := ethCommon.HexToAddress("0x03d55A7896097801B1dE90b4E3E0392CE279180A")
	_, err := handleLogCallback(
		factoryAddr,
		factoryAddr, // Actually the infra market
		factoryAddr, // Actually the lockup
		factoryAddr, // Actually SARP's on-chain signaller.
		lifiDiamond,
		l,
		func(blockHash, txHash, addr string) error {
			return nil // Unused for this test.
		},
		func(addr string) (bool, error) {
			return true, nil
		},
		func(table string, a any) error {
			assert.Equalf(t, "lifi_events_generic_swap_completed", table, "table not equal")
			wasRun = true
			return nil
		},
	)
	assert.NoError(t, err)
	assert.True(t, wasRun)
}

func TestStargateOFTReceived(t *testing.T) {
	s := strings.NewReader(`{
	"address": "0x8ee21165ecb7562ba716c9549c1de751282b9b33",
	"blockHash": "0x0ffa0e15b5e1b39cee90af47388b6cb714071313919fe196ffa2c53a7fce1e4f",
	"blockNumber": "0x1a8166",
	"data": "0x000000000000000000000000000000000000000000000000000000000000759e0000000000000000000000000000000000000000000000000000000000e20554",
	"logIndex": "0x2",
	"removed": false,
	"topics": [
		"0xefed6d3500546b29533b128a29e3a94d70788727f0507505ac12eaf2e578fd9c",
		"0x667da173724a06521ddf40c31096fccabcb314fc91e8892d53dfe3f1837d12bd",
		"0x00000000000000000000000012feae999fabba4b0086a257c9c5e350e62da0c9"
	],
	"transactionHash": "0xbed0282259ed65aa578c3d3dea59223b0a7fad583270cacfefc50c056de42969",
	"transactionIndex": "0x1"
}`)
	var l ethTypes.Log
	assert.Nilf(t, json.NewDecoder(s).Decode(&l), "failed to decode log")
	wasRun := false
	factoryAddr := ethCommon.HexToAddress("0x0000000000000000000000000000000000000000")
	_, err := handleLogCallback(
		factoryAddr,
		factoryAddr, // Actually the infra market
		factoryAddr, // Actually the lockup
		factoryAddr, // Actually SARP's on-chain signaller.
		factoryAddr,
		l,
		func(blockHash, txHash, addr string) error {
			return nil // Unused for this test.
		},
		func(addr string) (bool, error) {
			return true, nil
		},
		func(table string, a any) error {
			assert.Equalf(t, "stargate_events_stargate_oft_received", table, "table not equal")
			wasRun = true
			return nil
		},
	)
	assert.NoError(t, err)
	assert.True(t, wasRun)
}

func TestOnchainGm(t *testing.T) {
	s := strings.NewReader(`{
	"address": "0x8510ac40bea1b4261c0b08100f5bff186a00388c",
	"blockHash": "0x5776b1559fb4e627855cd65f92a40ac616790d81cc78a690dc1ad3e353381690",
	"blockNumber": "0x1cd01b",
	"data": "0x",
	"logIndex": "0x0",
	"removed": false,
	"topics": [
		"0x9290e8f5ba7fa69269d601e86762855088f9a24d834db4d6b3e603d7a522e56a",
		"0x00000000000000000000000078a2beebd9a01461662a56c397c74bd4356bd61b",
		"0x0000000000000000000000000000000000000000000000000000000000000000"
	],
	"transactionHash": "0x97a44120cbd43d4a256ef656a94240ed43365144e3e088253f57e8202d45fb08",
	"transactionIndex": "0x1"
}`)
	var l ethTypes.Log
	assert.Nilf(t, json.NewDecoder(s).Decode(&l), "failed to decode log")
	wasRun := false
	factoryAddr := ethCommon.HexToAddress("0x0000000000000000000000000000000000000000")
	_, err := handleLogCallback(
		factoryAddr,
		factoryAddr, // Actually the infra market
		factoryAddr, // Actually the lockup
		factoryAddr, // Actually SARP's on-chain signaller.
		factoryAddr,
		l,
		func(blockHash, txHash, addr string) error {
			return nil // Unused for this test.
		},
		func(addr string) (bool, error) {
			return true, nil
		},
		func(table string, a any) error {
			assert.Equalf(t, "onchaingm_events_onchaingmevent", table, "table not equal")
			wasRun = true
			return nil
		},
	)
	assert.NoError(t, err)
	assert.True(t, wasRun)
}
