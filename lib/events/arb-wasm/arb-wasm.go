package arb_wasm

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

var TopicProgramActivated = abi.Events["ProgramActivated"].ID

type EventProgramActivated struct {
	events.Event

	Codehash   events.Bytes   `json:"codehash"`
	ModuleHash events.Bytes   `json:"module_hash"`
	Program    events.Address `json:"program"`
	DataFee    events.Number  `json:"data_fee"`
	Version    uint16         `json:"version"`
}

func UnpackProgramActivated(topic1 ethCommon.Hash, data []byte) (*EventProgramActivated, error) {
	if abiErr != nil {
		return nil, fmt.Errorf("parse ArbWasm ABI: %v", abiErr)
	}
	i, err := abi.Unpack("ProgramActivated", data)
	if err != nil {
		return nil, fmt.Errorf("ProgramActivated: %v", err)
	}
	if len(i) != 4 {
		return nil, fmt.Errorf("ProgramActivated: expected 4 unindexed fields, got %d", len(i))
	}
	moduleHash, ok := i[0].([32]byte)
	if !ok {
		return nil, fmt.Errorf("moduleHash: %T", i[0])
	}
	program, ok := i[1].(ethCommon.Address)
	if !ok {
		return nil, fmt.Errorf("program: %T", i[1])
	}
	dataFee, ok := i[2].(*big.Int)
	if !ok {
		return nil, fmt.Errorf("dataFee: %T", i[2])
	}
	version, ok := i[3].(uint16)
	if !ok {
		return nil, fmt.Errorf("version: %T", i[3])
	}
	return &EventProgramActivated{
		Codehash:   events.BytesFromSlice(topic1.Bytes()),
		ModuleHash: events.BytesFromSlice(moduleHash[:]),
		Program:    events.AddressFromString(program.Hex()),
		DataFee:    events.NumberFromBig(dataFee),
		Version:    version,
	}, nil
}
