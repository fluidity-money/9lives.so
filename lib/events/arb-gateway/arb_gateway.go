package arb_gateway

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

var TopicWithdrawalInitiated = abi.Events["WithdrawalInitiated"].ID

type EventWithdrawalInitiated struct {
	events.Event

	L1Token events.Address `json:"l1_token"`
	From_   events.Address `json:"from_"`
	To_     events.Address `json:"to_"`
	L2ToL1Id events.Number  `json:"l2_to_l1_id"`
	ExitNum  events.Number  `json:"exit_num"`
	Amount   events.Number  `json:"amount"`
}

func UnpackWithdrawalInitiated(topic1, topic2, topic3 ethCommon.Hash, d []byte) (*EventWithdrawalInitiated, error) {
	i, err := abi.Unpack("WithdrawalInitiated", d)
	if err != nil {
		return nil, fmt.Errorf("WithdrawalInitiated: %v", err)
	}
	l1Token, ok := i[0].(ethCommon.Address)
	if !ok {
		return nil, fmt.Errorf("l1Token: %T", i[0])
	}
	exitNum, ok := i[1].(*big.Int)
	if !ok {
		return nil, fmt.Errorf("exitNum: %T", i[1])
	}
	amount, ok := i[2].(*big.Int)
	if !ok {
		return nil, fmt.Errorf("amount: %T", i[2])
	}
	return &EventWithdrawalInitiated{
		L1Token:  events.AddressFromString(l1Token.Hex()),
		From_:    hashToAddr(topic1),
		To_:      hashToAddr(topic2),
		L2ToL1Id: events.NumberFromBig(topic3.Big()),
		ExitNum:  events.NumberFromBig(exitNum),
		Amount:   events.NumberFromBig(amount),
	}, nil
}

func hashToAddr(h ethCommon.Hash) events.Address {
	v := ethCommon.BytesToAddress(h.Bytes())
	return events.AddressFromString(v.String())
}
