package rfqhub

import (
	"fmt"
	"math/big"
	"encoding/binary"
	"bytes"
	_ "embed"

	"github.com/fluidity-money/9lives.so/lib/types/events"

	ethAbi "github.com/ethereum/go-ethereum/accounts/abi"
	ethCommon "github.com/ethereum/go-ethereum/common"
)

//go:embed abi.json
var abiB []byte

var abi, abiErr = ethAbi.JSON(bytes.NewReader(abiB))

var TopicBalanceChanged = abi.Events["BalanceChanged"].ID

type (
	EventBalanceChanged struct {
		events.Event

		Recipient events.Address `json:"recipient"`
		Asset     events.Address `json:"asset"`
		Amount    uint64  `json:"amount"`
		Version   events.Number `json:"version"`
	}
)

func UnpackBalanceChanged(topic1, topic2, topic3 ethCommon.Hash, data []byte) (*EventBalanceChanged, error) {
	if l := len(data); l != 32 {
		return nil, fmt.Errorf("data size: %v", l)
	}
	// The number here is big endian so this is fine:
	ver := events.NumberFromBig(new(big.Int).SetBytes(data))
	return &EventBalanceChanged{
		Recipient: hashToAddr(topic1),
		Asset:     hashToAddr(topic2),
		Amount:    hashToUint64(topic3),
		Version: ver,
	}, nil
}

func hashToAddr(h ethCommon.Hash) events.Address {
	v := ethCommon.BytesToAddress(h.Bytes())
	return events.AddressFromString(v.String())
}

func hashToUint64(h ethCommon.Hash) uint64 {
	return binary.BigEndian.Uint64(h.Bytes()[32-8:])
}
