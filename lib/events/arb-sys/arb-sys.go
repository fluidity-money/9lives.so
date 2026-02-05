package arb_sys

import (
	"bytes"
	_ "embed"
	"fmt"
	"math/big"

	"github.com/fluidity-money/9lives.so/lib/types/events"

	ethAbi "github.com/ethereum/go-ethereum/accounts/abi"
	ethCommon "github.com/ethereum/go-ethereum/common"
)

//go:embed abi.json
var abiB []byte

var abi, abiErr = ethAbi.JSON(bytes.NewReader(abiB))

var TopicL2ToL1Tx = abi.Events["L2ToL1Tx"].ID

type EventL2ToL1Tx struct {
	events.Event

	Caller      events.Address `json:"caller"`
	Destination events.Address `json:"destination"`
	Hash        events.Number  `json:"hash"`
	Position    events.Number  `json:"position"`
	ArbBlockNum events.Number  `json:"arb_block_num"`
	EthBlockNum events.Number  `json:"eth_block_num"`
	Timestamp   events.Number  `json:"timestamp"`
	Callvalue   events.Number  `json:"callvalue"`
	Data        []byte         `json:"data"`
}

func UnpackL2ToL1Tx(topic1, topic2, topic3 ethCommon.Hash, d []byte) (*EventL2ToL1Tx, error) {
	i, err := abi.Unpack("L2ToL1Tx", d)
	if err != nil {
		return nil, fmt.Errorf("L2ToL1Tx: %v", err)
	}
	caller, ok := i[0].(ethCommon.Address)
	if !ok {
		return nil, fmt.Errorf("caller: %T", i[0])
	}
	arbBlockNum, ok := i[1].(*big.Int)
	if !ok {
		return nil, fmt.Errorf("arbBlockNum: %T", i[1])
	}
	ethBlockNum, ok := i[2].(*big.Int)
	if !ok {
		return nil, fmt.Errorf("ethBlockNum: %T", i[2])
	}
	timestamp, ok := i[3].(*big.Int)
	if !ok {
		return nil, fmt.Errorf("timestamp: %T", i[3])
	}
	callvalue, ok := i[4].(*big.Int)
	if !ok {
		return nil, fmt.Errorf("callvalue: %T", i[4])
	}
	data, ok := i[5].([]byte)
	if !ok {
		return nil, fmt.Errorf("data: %T", i[5])
	}
	return &EventL2ToL1Tx{
		Caller:      events.Address(caller.Hex()),
		Destination: hashToAddr(topic1),
		Hash:        events.NumberFromBig(topic2.Big()),
		Position:    events.NumberFromBig(topic3.Big()),
		ArbBlockNum: events.NumberFromBig(arbBlockNum),
		EthBlockNum: events.NumberFromBig(ethBlockNum),
		Timestamp:   events.NumberFromBig(timestamp),
		Callvalue:   events.NumberFromBig(callvalue),
		Data:        data,
	}, nil
}

func hashToAddr(h ethCommon.Hash) events.Address {
	v := ethCommon.BytesToAddress(h.Bytes())
	return events.AddressFromString(v.String())
}

func hashToNumber(h ethCommon.Hash) events.Number {
	return events.NumberFromBig(h.Big())
}
