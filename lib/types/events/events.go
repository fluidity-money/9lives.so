package events

import (
	sqlDriver "database/sql/driver"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"math/big"
	"regexp"
	"log"
	"strings"
	"time"
)

var reAddr = regexp.MustCompile("/^0x[a-fA-F0-9]{40}$/")

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

type NumberSlice []Number

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
	h, err := hex.DecodeString(strings.TrimPrefix(s, "0x"))
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
func (b Bytes) Bytes() []byte {
	return b.b
}
func (b Bytes) Value() (sqlDriver.Value, error) {
	return b.String(), nil
}
func (b *Bytes) Scan(a any) error {
	s, ok := a.(string)
	if !ok {
		return fmt.Errorf("unmarshal %T, wanted string", a)
	}
	x, err := BytesFromHex(s)
	if err != nil {
		return err
	}
	*b = *x
	return err
}

func AddressFromString(s string) Address {
	return Address(strings.ToLower(s))
}
func MaybeAddressFromString(s string) (*Address, error) {
	if reAddr.MatchString(s) {
		return nil, fmt.Errorf("match string: %#v", s)
	}
	x := AddressFromString(s)
	return &x, nil
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
func (r *Address) Scan(a any) (err error) {
	s, ok := a.(string)
	if !ok {
		return fmt.Errorf("unmarshal %T, wanted string", a)
	}
	x, err := MaybeAddressFromString(s)
	if err != nil {
		return err
	}
	*r = *x
	return err
}

func NumberFromBig(x *big.Int) Number {
	if x == nil {
		x = new(big.Int)
	}
	return Number{x}
}
func NumberFromString(s string) (*Number, error) {
	i, ok := new(big.Int).SetString(s, 10)
	if !ok {
		return nil, fmt.Errorf("not number: %v", s)
	}
	return &Number{i}, nil
}
func (n Number) String() string {
	return n.i.String()
}

// Big underlying number without a copy.
func (n Number) Big() *big.Int {
	return n.i
}
func (n Number) Int64() int64 {
	return n.i.Int64()
}
func (n Number) Value() (sqlDriver.Value, error) {
	if n.i == nil {
		return "0", nil
	}
	return n.String(), nil
}
func (n *Number) Scan(a any) error {
	s, ok := a.(string)
	if !ok {
		return fmt.Errorf("unmarshal %T, wanted string", a)
	}
	x, err := NumberFromString(s)
	if err != nil {
		return err
	}
	*n = *x
	return err
}
func (n *Number) MarshalJSON() ([]byte, error) {
	// This needs to be explicitly implemented thanks to Gorm...
	return json.Marshal(n.String())
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

func (x NumberSlice) Value() (sqlDriver.Value, error) {
	b, err := json.Marshal(x)
	if err != nil {
		return "", fmt.Errorf("number slice marshal: %v", err)
	}
	log.Printf("marshalled: %s", string(b))
	log.Printf("should've been: %v", x)
	return string(b), nil
}
func (x NumberSlice) Scan(a any) error {
	b, ok := a.([]byte)
	if !ok {
		return fmt.Errorf("number slice scan type: %T", a)
	}
	if err := json.Unmarshal(b, &x); err != nil {
		return fmt.Errorf("unmarshal number slice: %v", err)
	}
	return nil
}