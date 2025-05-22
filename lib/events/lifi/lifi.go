package lifi

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

var TopicLifiGenericSwapCompleted = abi.Events["LiFiGenericSwapCompleted"].ID

type EventLifiGenericSwapCompleted struct {
	events.Event

	TransactionId events.Bytes   `json:"transaction_id"`
	Integrator    string         `json:"integrator"`
	Referrer      string         `json:"referrer"`
	Receiver      events.Address `json:"receiver"`
	FromAssetId   events.Address `json:"from_asset_id"`
	ToAssetId     events.Address `json:"to_asset_id"`
	FromAmount    events.Number  `json:"from_amount'`
	ToAmount      events.Number  `json:"to_amount"`
}

func UnpackLifiGenericSwapCompleted(topic1 ethCommon.Hash, b []byte) (*EventLifiGenericSwapCompleted, error) {
	i, err := abi.Unpack("LiFiGenericSwapCompleted", b)
	if err != nil {
		return nil, err
	}
	integrator, ok := i[0].(string)
	if !ok {
		return nil, fmt.Errorf("bad integrator: %T", i[0])
	}
	referrer, ok := i[1].(string)
	if !ok {
		return nil, fmt.Errorf("bad referrer: %T", i[0])
	}
	receiver, ok := i[2].(ethCommon.Address)
	if !ok {
		return nil, fmt.Errorf("bad receiver: %T", i[0])
	}
	fromAssetId, ok := i[3].(ethCommon.Address)
	if !ok {
		return nil, fmt.Errorf("bad fromAssetId: %T", i[0])
	}
	toAssetId, ok := i[4].(ethCommon.Address)
	if !ok {
		return nil, fmt.Errorf("bad toAssetId: %T", i[0])
	}
	fromAmount, ok := i[5].(*big.Int)
	if !ok {
		return nil, fmt.Errorf("bad fromAmount: %T", i[0])
	}
	toAmount, ok := i[6].(*big.Int)
	if !ok {
		return nil, fmt.Errorf("bad toAmount: %T", i[0])
	}
	return &EventLifiGenericSwapCompleted{
		TransactionId: hashToBytes32(topic1),
		Integrator:    integrator,
		Referrer:      referrer,
		Receiver:      events.AddressFromString(receiver.String()),
		FromAssetId:   events.AddressFromString(fromAssetId.String()),
		ToAssetId:     events.AddressFromString(toAssetId.String()),
		FromAmount:    events.NumberFromBig(fromAmount),
		ToAmount:      events.NumberFromBig(toAmount),
	}, nil
}

func hashToBytes32(h ethCommon.Hash) events.Bytes {
	return events.BytesFromSlice(h.Bytes())
}
