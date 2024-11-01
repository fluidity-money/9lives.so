package events

import (
	sqlDriver "database/sql/driver"
	"encoding/hex"
	"encoding/json"
	"strings"
	"math/big"
	"fmt"
	"time"
)

type Bytes []byte

type (
	Hash    Bytes
	Address string
	Number struct {
		i *big.Int
	}
)

type Event struct {
	CreatedBy       time.Time `json:"created_by"`
	BlockHash       Hash      `json:"block_hash"`
	TransactionHash Hash      `json:"transaction_hash"`
	BlockNumber     uint64    `json:"block_number"`
	EmitterAddr     Address   `json:"emitter_addr"`
}

func BytesFromHex(s string) ([]byte, error) {
	return hex.DecodeString(s)
}
func (x *Bytes) UnmarshalJSON(b []byte) (err error) {
	var s string
	if err := json.Unmarshal(b, &x); err != nil {
		return err
	}
	if *x, err = BytesFromHex(s); err != nil {
		return err
	}
	return nil
}
func (b Bytes) String() string {
	return hex.EncodeToString([]byte(b))
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
