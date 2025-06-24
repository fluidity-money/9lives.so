package dinero

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

var TopicOwnershipTransferred = abi.Events["OwnershipTransferred"].ID

type EventOwnershipTransferred struct {
	events.Event

	PreviousOwner events.Address `json:"previous_owner"`
	NewOwner      events.Address `json:"new_owner"`
}

func UnpackOwnershipTransferred(topic1, topic2 ethCommon.Hash, d []byte) (*EventOwnershipTransferred, error) {
	return &EventOwnershipTransferred{
		PreviousOwner: hashToAddr(topic1),
		NewOwner:      hashToAddr(topic2),
	}, nil
}

func hashToAddr(h ethCommon.Hash) events.Address {
	v := ethCommon.BytesToAddress(h.Bytes())
	return events.AddressFromString(v.String())
}

func hashToBytes32(h ethCommon.Hash) events.Bytes {
	return events.BytesFromSlice(h.Bytes())
}
