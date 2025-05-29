package stargate

import (
	"bytes"
	"fmt"
	_ "embed"
	"math/big"

	"github.com/fluidity-money/9lives.so/lib/types/events"

	ethCommon "github.com/ethereum/go-ethereum/common"
	ethAbi "github.com/ethereum/go-ethereum/accounts/abi"
)

//go:embed abi-events.json
var abiB []byte

var abi, abiErr = ethAbi.JSON(bytes.NewReader(abiB))

var TopicStargateOFTReceived = abi.Events["OFTReceived"].ID

type EventStargateOFTReceived struct {
	events.Event

	Guid           events.Bytes   `json:"guid"`
	SrcEid         uint32         `json:"src_eid"`
	ToAddress      events.Address `json:"to_address"`
	AmountReceivedLd events.Number  `json:"amount_received"`
}

func UnpackStargateOFTReceived(topic1, topic2 ethCommon.Hash, b []byte) (*EventStargateOFTReceived, error) {
	i, err := abi.Unpack("OFTReceived", b)
	if err != nil {
		return nil, err
	}
	srcEid, ok := i[0].(uint32)
	if !ok {
		return nil, fmt.Errorf("srcEid: %T", i[0])
	}
	amountReceivedLd, ok := i[1].(*big.Int)
	if !ok {
		return nil, fmt.Errorf("amountReceivedLD: %T", i[1])
	}
	return &EventStargateOFTReceived{
		Guid:             hashToBytes32(topic1),
		SrcEid:           srcEid,
		ToAddress:        hashToAddr(topic2),
		AmountReceivedLd: events.NumberFromBig(amountReceivedLd),
	}, nil
}

func hashToAddr(h ethCommon.Hash) events.Address {
	v := ethCommon.BytesToAddress(h.Bytes())
	return events.AddressFromString(v.String())
}

func hashToBytes32(h ethCommon.Hash) events.Bytes {
	return events.BytesFromSlice(h.Bytes())
}

func hashToNumber(h ethCommon.Hash) events.Number {
	return events.NumberFromBig(h.Big())
}
