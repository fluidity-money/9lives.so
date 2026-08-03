package rfqhub

import (
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

		Recipient         events.Address `json:"recipient"`
		Amount    events.Number  `json:"amount"`
	}
)

func UnpackBalanceChanged(topic1, topic2 ethCommon.Hash) (*EventBalanceChanged, error) {
	return &EventBalanceChanged{
		Recipient:         hashToAddr(topic1),
		Amount:    hashToNumber(topic2),
	}, nil
}

func hashToAddr(h ethCommon.Hash) events.Address {
	v := ethCommon.BytesToAddress(h.Bytes())
	return events.AddressFromString(v.String())
}

func hashToNumber(h ethCommon.Hash) events.Number {
	return events.NumberFromBig(h.Big())
}
