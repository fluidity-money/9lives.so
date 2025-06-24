package stargate

import (
	"bytes"
	_ "embed"
	"fmt"
	"math/big"

	"github.com/fluidity-money/9lives.so/lib/types/events"

	ethAbi "github.com/ethereum/go-ethereum/accounts/abi"
	ethCommon "github.com/ethereum/go-ethereum/common"
)

//go:embed abi-events.json
var abiB []byte

var abi, abiErr = ethAbi.JSON(bytes.NewReader(abiB))

var (
	TopicStargateOFTReceived = abi.Events["OFTReceived"].ID
	TopicStargateOFTSent              = abi.Events["OFTSent"].ID
)

type (
	EventStargateOFTReceived struct {
		events.Event

		Guid             events.Bytes   `json:"guid"`
		SrcEid           uint32         `json:"src_eid"`
		ToAddress        events.Address `json:"to_address"`
		AmountReceivedLd events.Number  `json:"amount_received"`
	}

	EventOFTSent struct {
		events.Event

		Guid             events.Bytes   `json:"guid"`
		DstEid           uint32         `json:"dst_eid"`
		FromAddress      events.Address `json:"from_address"`
		AmountSentLD     events.Number  `json:"amount_sent_ld"`
		AmountReceivedLd events.Number  `json:"amount_received_ld"`
	}
)

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

func UnpackStargateOFTSent(topic1, topic2 ethCommon.Hash, d []byte) (*EventOFTSent, error) {
	i, err := abi.Unpack("OFTSent", d)
	if err != nil {
		return nil, fmt.Errorf("unpack: %v", err)
	}
	dstEid, ok := i[0].(uint32)
	if !ok {
		return nil, fmt.Errorf("dstEid: %T", i[0])
	}
	amountSentLd, ok := i[1].(*big.Int)
	if !ok {
		return nil, fmt.Errorf("amountSentLD: %T", i[1])
	}
	amountReceivedLd, ok := i[2].(*big.Int)
	if !ok {
		return nil, fmt.Errorf("amountReceivedLD: %T", i[2])
	}
	return &EventOFTSent{
		Guid:             hashToBytes32(topic1),
		DstEid:           dstEid,
		FromAddress:      hashToAddr(topic2),
		AmountSentLD:     events.NumberFromBig(amountSentLd),
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
