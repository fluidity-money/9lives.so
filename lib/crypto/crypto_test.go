package crypto

import (
	"encoding/hex"
	"math/big"
	"testing"

	"github.com/fluidity-money/9lives.so/lib/types/paymaster"

	"github.com/stretchr/testify/assert"

	ethCommon "github.com/ethereum/go-ethereum/common"
)

func TestGetMarketId(t *testing.T) {
	outcomes := []Outcome{
		{
			Name: "Yes",
			Seed: 671424635701772,
		},
		{
			Name: "No",
			Seed: 4374720138937106,
		},
	}
	outcomeIds, err := GetOutcomeIds(outcomes)
	assert.Nil(t, err)
	// these test result will not be correct because description is removed after
	// so test will fail, fix expected outputs
	assert.Equalf(t, hex.EncodeToString(outcomeIds[0]), "72cfc911637aa0c4", "outcome 1 bad")
	assert.Equalf(t, hex.EncodeToString(outcomeIds[1]), "d2cd4a70ce6885d5", "outcome 2 bad")
	assert.Equal(t,
		"c27b300def7bb415cd56c150b2cb186e10a55980a39d974f8c6feb083f745514",
		hex.EncodeToString(GetMarketId(outcomes)),
	)
}

func TestEcrecoverPaymasterOperation(t *testing.T) {
	o, _ := hex.DecodeString("a9fc8624b9a93049")
	var outcome [8]byte
	copy(outcome[:], o)
	var R, S [32]byte
	r, ok := new(big.Int).SetString("ed077dd9d9ff110d5bf47091b3341ecd2baabdbc647761ab79022c68080edc54", 16)
	assert.True(t, ok)
	r.FillBytes(R[:])
	s, ok := new(big.Int).SetString("29c6c2304ef97e8b77a0c122c613ad3718211e33f4dd65d728b67b0ab17a0857", 16)
	assert.True(t, ok)
	s.FillBytes(S[:])
	spnChainId := new(big.Int).SetInt64(55244)
	originatingChainId := new(big.Int).SetInt64(1)
	addr, err := EcrecoverPaymasterOperation(
		spnChainId,
		originatingChainId,
		ethCommon.HexToAddress("0x0000000000000000000000000000000000000000"),
		PaymasterOperation{
			Owner:         ethCommon.HexToAddress("0x63177184B8b5e1229204067a76Ec4c635009CBD2"),
			Nonce:         new(big.Int).SetInt64(0),
			Deadline:      new(big.Int).SetInt64(1750347566),
			PaymasterType: paymaster.PaymasterTypeMint,
			Market:        ethCommon.HexToAddress("0x7ab5ec0c59332a5c993468357c70e96b348aeb62"),
			MaximumFee:    new(big.Int).SetInt64(0),
			AmountToSpend: new(big.Int).SetInt64(1000000),
			MinimumBack:   new(big.Int).SetInt64(0),
			Referrer:      ethCommon.HexToAddress("0x0000000000000000000000000000000000000000"),
			Outcome:       outcome,
			V:             28,
			R:             R,
			S:             S,
		},
	)
	assert.NoError(t, err)
	assert.Equal(t,
		ethCommon.HexToAddress("0x63177184B8b5e1229204067a76Ec4c635009CBD2"),
		addr,
	)
}
