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
	o, _ := hex.DecodeString("3757cf75e4508cae")
	var outcome [8]byte
	copy(outcome[:], o)
	var R, S [32]byte
	r, ok := new(big.Int).SetString("ce9998f2caf2ea6aa710a260fa3fdc62300e1110bdd215411c84bcc458f11d65", 16)
	assert.True(t, ok)
	r.FillBytes(R[:])
	s, ok := new(big.Int).SetString("46f7280619c325a7bd719f6f591ee718e47c1000be2ad588b6322c113cbdf090", 16)
	assert.True(t, ok)
	s.FillBytes(S[:])
	spnChainId := new(big.Int).SetInt64(55244)
	originatingChainId := new(big.Int).SetInt64(55244)
	addr, err := EcrecoverPaymasterOperation(
		spnChainId,
		originatingChainId,
		ethCommon.HexToAddress("0x0000000000000000000000000000000000000000"),
		PaymasterOperation{
			Owner:         ethCommon.HexToAddress("0x63177184B8b5e1229204067a76Ec4c635009CBD2"),
			Nonce:         new(big.Int).SetInt64(0),
			Deadline:      new(big.Int).SetInt64(1750418163),
			PaymasterType: paymaster.PaymasterTypeMint,
			Market:        ethCommon.HexToAddress("0x2Ef8FE80F525BfeCA66Cd16Bd9e8af5556f40b11"),
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
		*addr,
	)
}
