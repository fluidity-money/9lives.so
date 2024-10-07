package crypto

import (
	"bytes"
	"encoding/binary"
	"fmt"
	"sort"

	ethCommon "github.com/ethereum/go-ethereum/common"
	ethCrypto "github.com/ethereum/go-ethereum/crypto"
)

type Outcome struct {
	Name, Desc string
	Seed       int
}

func GetOutcomeId(name, desc string, seed int) ([]byte, error) {
	var buf bytes.Buffer
	if _, err := buf.WriteString(name); err != nil {
		return nil, err
	}
	if _, err := buf.WriteString(desc); err != nil {
		return nil, err
	}
	err := binary.Write(&buf, binary.BigEndian, uint8(seed))
	if err != nil {
		return nil, err
	}
	x := ethCrypto.Keccak256(buf.Bytes())[:8]
	return x, nil
}

func GetOutcomeIds(outcomes []Outcome) (ids [][]byte, err error) {
	ids = make([][]byte, len(outcomes))
	for i, o := range outcomes {
		ids[i], err = GetOutcomeId(o.Name, o.Desc, o.Seed)
		if err != nil {
			return nil, fmt.Errorf("get outcome id: %v", err)
		}
	}
	sort.Slice(ids, func(i, j int) bool {
		//i < j
		return bytes.Compare(ids[i], ids[j]) <= 0
	})
	return
}

func GetTradingAddr(ids [][]byte, factoryAddr ethCommon.Address, bytecodeHash []byte) ethCommon.Address {
	return ethCrypto.CreateAddress2(
		factoryAddr,
		[32]byte(ethCrypto.Keccak256(ids...)),
		bytecodeHash,
	)
}