package main

import (
	"encoding/json"
	"strings"
	"testing"

	"github.com/fluidity-money/9lives.so/lib/types/events"

	"github.com/stretchr/testify/assert"

	ethTypes "github.com/ethereum/go-ethereum/core/types"
	ethCommon "github.com/ethereum/go-ethereum/common"
)

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
