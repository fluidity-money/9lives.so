package dinero

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

var (
	TopicOFTReceived          = abi.Events["OFTReceived"].ID
	TopicOFTSent              = abi.Events["OFTSent"].ID
	TopicOwnershipTransferred = abi.Events["OwnershipTransferred"].ID
)

type (
	EventOFTReceived struct {
		events.Event

		Guid             events.Bytes   `json:"guid"`
		SrcEid           uint32         `json:"src_eid"`
		ToAddress        events.Address `json:"to_address"`
		AmountReceivedLD events.Number  `json:"amount_received_ld"`
	}

	EventOFTSent struct {
		events.Event

		Guid             events.Bytes   `json:"guid"`
		DstEid           uint32         `json:"dst_eid"`
		FromAddress      events.Address `json:"from_address"`
		AmountSentLD     events.Number  `json:"amount_sent_ld"`
		AmountReceivedLD events.Number  `json:"amount_received_ld"`
	}

	EventOwnershipTransferred struct {
		events.Event

		PreviousOwner events.Address `json:"previous_owner"`
		NewOwner       events.Address `json:"new_owner"`
	}
)

func UnpackOFTReceived(topic1, topic2 ethCommon.Hash, d []byte) (*EventOFTReceived, error) {
	i, err := abi.Unpack("OFTReceived", d)
	if err != nil {
		return nil, fmt.Errorf("unpack: %v", err)
	}
	srcEid, ok := i[0].(uint32)
	if !ok {
		return nil, fmt.Errorf("srcEid: %T", i[0])
	}
	amountReceivedLD, ok := i[1].(*big.Int)
	if !ok {
		return nil, fmt.Errorf("amountReceivedLD: %T", i[1])
	}
	return &EventOFTReceived{
		Guid:             hashToBytes32(topic1),
		SrcEid:           srcEid,
		ToAddress:        hashToAddr(topic2),
		AmountReceivedLD: events.NumberFromBig(amountReceivedLD),
	}, nil
}

func UnpackOFTSent(topic1, topic2 ethCommon.Hash, d []byte) (*EventOFTSent, error) {
	i, err := abi.Unpack("OFTSent", d)
	if err != nil {
		return nil, fmt.Errorf("unpack: %v", err)
	}
	dstEid, ok := i[0].(uint32)
	if !ok {
		return nil, fmt.Errorf("dstEid: %T", i[0])
	}
	amountSentLD, ok := i[1].(*big.Int)
	if !ok {
		return nil, fmt.Errorf("amountSentLD: %T", i[1])
	}
	amountReceivedLD, ok := i[2].(*big.Int)
	if !ok {
		return nil, fmt.Errorf("amountReceivedLD: %T", i[2])
	}
	return &EventOFTSent{
		Guid:             hashToBytes32(topic1),
		DstEid:           dstEid,
		FromAddress:        hashToAddr(topic2),
		AmountSentLD: events.NumberFromBig(amountSentLD),
		AmountReceivedLD: events.NumberFromBig(amountReceivedLD),
	}, nil
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
