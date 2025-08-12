package paymaster

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
	TopicPaymasterPaidFor = abi.Events["PaymasterPaidFor"].ID
	TopicStargateBridged  = abi.Events["StargateBridged"].ID
)

type (
	EventPaymasterPaidFor struct {
		events.Event

		Owner         events.Address `json:"owner"`
		MaximumFee    events.Number  `json:"maximumFee"`
		AmountToSpend events.Number  `json:"amountToSpend"`
		FeeTaken      events.Number  `json:"feeTaken"`
		Referrer      events.Address `json:"referrer"`
		Outcome       events.Bytes   `json:"outcome"`
	}

	EventStargateBridged struct {
		events.Event

		Guid           events.Bytes   `json:"guid"`
		Spender        events.Address `json:"spender"`
		AmountReceived events.Number  `json:"amountReceived"`
		AmountFee      events.Number  `json:"amountFee"`
		DestinationEid uint32         `json:"destinationEid"`
	}
)

func UnpackPaymasterPaidFor(topic1, topic2, topic3 ethCommon.Hash, d []byte) (*EventPaymasterPaidFor, error) {
	a, err := abi.Unpack("PaymasterPaidFor", d)
	if err != nil {
		return nil, fmt.Errorf("unpack: %v", err)
	}
	feeTaken, ok := a[0].(*big.Int)
	if !ok {
		return nil, fmt.Errorf("feeTaken: %T", a[0])
	}
	referrer, ok := a[1].(ethCommon.Address)
	if !ok {
		return nil, fmt.Errorf("referrer: %T", a[1])
	}
	outcome, ok := a[2].([8]byte)
	if !ok {
		return nil, fmt.Errorf("outcome: %T", a[2])
	}
	return &EventPaymasterPaidFor{
		Owner:         hashToAddr(topic1),
		MaximumFee:    hashToNumber(topic2),
		AmountToSpend: hashToNumber(topic3),
		FeeTaken:      events.NumberFromBig(feeTaken),
		Referrer:      events.AddressFromString(referrer.String()),
		Outcome:       events.BytesFromSlice(outcome[:]),
	}, nil
}

func UnpackStargateBridged(topic1, topic2, topic3 ethCommon.Hash, d []byte) (*EventStargateBridged, error) {
	a, err := abi.Unpack("StargateBridged", d)
	if err != nil {
		return nil, fmt.Errorf("unpack: %v", err)
	}
	amountFee, ok := a[0].(*big.Int)
	if !ok {
		return nil, fmt.Errorf("amountFee: %v", err)
	}
	destinationEid, ok := a[1].(uint32)
	if !ok {
		return nil, fmt.Errorf("destinationEid: %v", err)
	}
	return &EventStargateBridged{
		Guid: hashToBytes32(topic1),
		Spender: hashToAddr(topic2),
		AmountReceived: hashToNumber(topic3),
		AmountFee: events.NumberFromBig(amountFee),
		DestinationEid: destinationEid,
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
