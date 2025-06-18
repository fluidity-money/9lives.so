package onchaingm

import (
	_ "embed"
	"bytes"

	"github.com/fluidity-money/9lives.so/lib/types/events"

	ethAbi "github.com/ethereum/go-ethereum/accounts/abi"
	ethCommon "github.com/ethereum/go-ethereum/common"
)

//go:embed abi.json
var abiB []byte

var abi, _ = ethAbi.JSON(bytes.NewReader(abiB))

var TopicOnchainGm = abi.Events["OnChainGMEvent"].ID

type EventOnchainGM struct {
	events.Event

	Sender   events.Address `json:"sender"`
	Referrer events.Address `json:"referrer"`
}

func UnpackOnchainGm(topic1, topic2 ethCommon.Hash) (*EventOnchainGM, error) {
	return &EventOnchainGM {
		Sender: hashToAddr(topic1),
		Referrer: hashToAddr(topic2),
	}, nil
}

func hashToAddr(h ethCommon.Hash) events.Address {
	v := ethCommon.BytesToAddress(h.Bytes())
	return events.AddressFromString(v.String())
}