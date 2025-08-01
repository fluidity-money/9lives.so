package punk_domains

import (
	_ "embed"
	"fmt"
	"bytes"

	"github.com/fluidity-money/9lives.so/lib/types/events"

	ethAbi "github.com/ethereum/go-ethereum/accounts/abi"
	ethCommon "github.com/ethereum/go-ethereum/common"
)

//go:embed abi.json
var abiB []byte

var abi, abiErr = ethAbi.JSON(bytes.NewReader(abiB))

var TopicDefaultDomainChanged = abi.Events["DefaultDomainChanged"].ID

type EventDefaultDomainChanged struct {
	events.Event

	Address       events.Address `json:"address"`
	DefaultDomain string         `json:"defaultDomain"`
}

func UnpackDefaultDomainChanged(topic1 ethCommon.Hash, d []byte) (*EventDefaultDomainChanged, error) {
	i, err := abi.Unpack("DefaultDomainChanged", d)
	if err != nil {
		return nil, fmt.Errorf("unpack: %v", err)
	}
	n, ok := i[0].(string)
	if !ok {
		return nil, fmt.Errorf("defaultDomain type: %T", i[0])
	}
	return &EventDefaultDomainChanged{
		Address: hashToAddr(topic1),
		DefaultDomain: n,
	}, nil
}

func hashToAddr(h ethCommon.Hash) events.Address {
	v := ethCommon.BytesToAddress(h.Bytes())
	return events.AddressFromString(v.String())
}