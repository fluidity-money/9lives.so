package events

import (
	"bytes"
	_ "embed"
	"fmt"
	"math/big"
	"time"

	"github.com/fluidity-money/9lives.so/lib/types/events"

	ethAbi "github.com/ethereum/go-ethereum/accounts/abi"
	ethCommon "github.com/ethereum/go-ethereum/common"
)

//go:embed abi-events.json
var abiB []byte

var abi, _ = ethAbi.JSON(bytes.NewReader(abiB))

var (
	TopicNewTrading2     = abi.Events["NewTrading2"].ID
	TopicOutcomeCreated  = abi.Events["OutcomeCreated"].ID
	TopicOutcomeDecided  = abi.Events["OutcomeDecided"].ID
	TopicSharesMinted    = abi.Events["SharesMinted"].ID
	TopicPayoffActivated = abi.Events["PayoffActivated"].ID
)

func UnpackNewTrading2(topic1, topic2, topic3 ethCommon.Hash, b []byte) (*events.EventNewTrading2, string, error) {
	addr := hashToAddr(topic2)
	i, err := abi.Unpack("NewTrading2", b)
	if err != nil {
		return nil, "", err
	}
	backend, ok := i[0].(uint8)
	if !ok {
		return nil, "", fmt.Errorf("bad backend: %T", i[0])
	}
	return &events.EventNewTrading2{
		Identifier: hashToBytes(topic1),
		Addr:       addr,
		Oracle:     hashToAddr(topic3),
		Backend:    backend,
	}, addr.String(), nil
}

func UnpackOutcomeCreated(topic1, topic2, topic3 ethCommon.Hash) (*events.EventOutcomeCreated, error) {
	return &events.EventOutcomeCreated{
		TradingIdentifier: hashToBytes(topic1),
		Erc20Identifier:   hashToBytes(topic2),
		Erc20Addr:         hashToAddr(topic3),
	}, nil
}

func UnpackOutcomeDecided(topic1, topic2 ethCommon.Hash) (*events.EventOutcomeDecided, error) {
	return &events.EventOutcomeDecided{
		Identifier: hashToBytes(topic1),
		Oracle:     hashToAddr(topic2),
	}, nil
}

func UnpackSharesMinted(topic1, topic2, topic3 ethCommon.Hash, b []byte) (*events.EventSharesMinted, error) {
	i, err := abi.Unpack("SharesMinted", b)
	if err != nil {
		return nil, err
	}
	recipient, ok := i[0].(ethCommon.Address)
	if !ok {
		return nil, fmt.Errorf("bad recipient: %T", i[0])
	}
	fusdcSpent, ok := i[1].(*big.Int)
	if !ok {
		return nil, fmt.Errorf("bad fusdc spent: %T", i[1])
	}
	return &events.EventSharesMinted{
		Identifier:  hashToBytes(topic1),
		ShareAmount: hashToNumber(topic2),
		Spender:     hashToAddr(topic3),
		Recipient:   events.AddressFromString(recipient.String()),
		FusdcSpent:  events.NumberFromBig(fusdcSpent),
	}, nil
}

func UnpackPayoffActivated(topic1, topic2, topic3 ethCommon.Hash, b []byte) (*events.EventPayoffActivated, error) {
	i, err := abi.Unpack("PayoffActivated", b)
	if err != nil {
		return nil, err
	}
	recipient, ok := i[0].(ethCommon.Address)
	if !ok {
		return nil, fmt.Errorf("bad recipient: %T", i[0])
	}
	fusdcReceived, ok := i[1].(*big.Int)
	if !ok {
		return nil, fmt.Errorf("bad fusdc received: %T", i[1])
	}
	return &events.EventPayoffActivated{
		Identifier:    hashToBytes(topic1),
		SharesSpent:   hashToNumber(topic2),
		Spender:       hashToAddr(topic3),
		Recipient:     events.AddressFromString(recipient.String()),
		FusdcReceived: events.NumberFromBig(fusdcReceived),
	}, nil
}

func UnpackDeadlineExtension(topic1, topic2 ethCommon.Hash) (*events.EventDeadlineExtension, error) {
	return &events.EventDeadlineExtension{
		TimeBefore: time.Unix(hashToNumber(topic1).Int64(), 0),
		TimeAfter:  time.Unix(hashToNumber(topic2).Int64(), 0),
	}, nil
}

func hashToBytes(h ethCommon.Hash) events.Bytes {
	return events.BytesFromSlice(h.Bytes())
}

func hashToAddr(h ethCommon.Hash) events.Address {
	v := ethCommon.BytesToAddress(h.Bytes())
	return events.AddressFromString(v.String())
}

func hashToNumber(h ethCommon.Hash) events.Number {
	return events.NumberFromBig(h.Big())
}
