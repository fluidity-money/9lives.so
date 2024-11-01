package events

import (
	sqlDriver "database/sql/driver"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"math/big"
	"strings"
	"time"
)

type Bytes struct {
	b []byte
}

type (
	Hash    Bytes
	Address string
	Number  struct {
		i *big.Int
	}
)

type Event struct {
	CreatedBy       time.Time `json:"created_by"`
	BlockHash       string    `json:"block_hash"`
	TransactionHash string    `json:"transaction_hash"`
	BlockNumber     uint64    `json:"block_number"`
	EmitterAddr     string    `json:"emitter_addr"`
}

func BytesFromSlice(x []byte) Bytes {
	return Bytes{x}
}
func BytesFromHex(s string) (*Bytes, error) {
	h, err := hex.DecodeString(s)
	if err != nil {
		return nil, err
	}
	return &Bytes{h}, nil
}
func (x *Bytes) UnmarshalJSON(b []byte) (err error) {
	var s string
	if err := json.Unmarshal(b, &x); err != nil {
		return err
	}
	e, err := BytesFromHex(s)
	if err != nil {
		return err
	}
	*x = *e
	return nil
}
func (b Bytes) String() string {
	return hex.EncodeToString([]byte(b.b))
}
func (b Bytes) Value() (sqlDriver.Value, error) {
	return b.String(), nil
}

func AddressFromString(s string) Address {
	return Address(strings.ToLower(s))
}
func (a Address) String() string {
	return strings.ToLower(string(a))
}
func (a Address) Value() (sqlDriver.Value, error) {
	return a.String(), nil
}
func (a *Address) UnmarshalJSON(b []byte) error {
	var s string
	if err := json.Unmarshal(b, &s); err != nil {
		return err
	}
	*a = AddressFromString(s)
	return nil
}

func NumberFromBig(x *big.Int) Number {
	return Number{x}
}
func (n Number) String() string {
	return n.i.String()
}
func (n Number) Value() (sqlDriver.Value, error) {
	return n.String(), nil
}
func (n *Number) UnmarshalJSON(b []byte) error {
	var s string
	if err := json.Unmarshal(b, &s); err != nil {
		return err
	}
	i, ok := new(big.Int).SetString(s, 10)
	if !ok {
		return fmt.Errorf("not number: %v", s)
	}
	*n = Number{i}
	return nil
}
