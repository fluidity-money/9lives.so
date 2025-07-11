package sudoswap

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

var TopicNewERC721Pair = abi.Events["NewERC721Pair"].ID

// EventNewERC721Pair is difficult to store in the database, so we store
// this here in a very literal form as you see, but in the database, it's
// stored as a JSONB object.
type EventNewERC721Pair struct {
	events.Event

	PoolAddress events.Address     `json:"pool_address"`
	InitialIds  events.NumberSlice `json:"initial_ids"`
}

func UnpackNewERC721Pair(topic1 ethCommon.Hash, d []byte) (*EventNewERC721Pair, error) {
	a, err := abi.Unpack("NewERC721Pair", d)
	if err != nil {
		return nil, fmt.Errorf("new pair: %v", err)
	}
	initialIds_, ok := a[0].([]*big.Int)
	if !ok {
		return nil, fmt.Errorf("initial ids: %T", a[0])
	}
	initialIds := make([]events.Number, len(initialIds_))
	for i, v := range initialIds_ {
		initialIds[i] = events.NumberFromBig(v)
	}
	return &EventNewERC721Pair{
		PoolAddress: hashToAddr(topic1),
		InitialIds:  initialIds,
	}, nil
}

func hashToAddr(h ethCommon.Hash) events.Address {
	v := ethCommon.BytesToAddress(h.Bytes())
	return events.AddressFromString(v.String())
}
