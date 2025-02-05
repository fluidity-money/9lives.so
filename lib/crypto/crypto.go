package crypto

import (
	"bytes"
	"encoding/binary"
	"fmt"
	"sort"

	ethCrypto "github.com/ethereum/go-ethereum/crypto"
)

type Outcome struct {
	Name string
	Seed uint64
}

func GetOutcomeId(name string, seed uint64) ([]byte, error) {
	var buf bytes.Buffer
	if _, err := buf.WriteString(name); err != nil {
		return nil, err
	}
	err := binary.Write(&buf, binary.BigEndian, uint64(seed))
	if err != nil {
		return nil, err
	}
	x := ethCrypto.Keccak256(buf.Bytes())[:8]
	return x, nil
}

func GetOutcomeIds(outcomes []Outcome) (ids [][]byte, err error) {
	ids = make([][]byte, len(outcomes))
	for i, o := range outcomes {
		ids[i], err = GetOutcomeId(o.Name, o.Seed)
		if err != nil {
			return nil, fmt.Errorf("get outcome id: %v", err)
		}
	}
	// Sort the ids given by first the length, then by a ascending sort.
	sort.Slice(ids, func(i, j int) bool {
		if len(ids[i]) != len(ids[j]) {
			return len(ids[i]) < len(ids[j])
		}
		return bytes.Compare(ids[i], ids[j]) <= 0
	})
	return
}

func GetMarketId(outcomes []Outcome) []byte {
	ids, err := GetOutcomeIds(outcomes)
	if err != nil {
		return nil
	}
	return ethCrypto.Keccak256(ids...)
}
