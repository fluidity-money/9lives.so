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
	r, ok := new(big.Int).SetString("237856b47873650d4d31c405dae33fb851ec773b1716fbb93e5a4ba22f48554e", 16)
	assert.True(t, ok)
	r.FillBytes(R[:])
	s, ok := new(big.Int).SetString("6f024a5f55b6733783a49ce27e8be04f8ef0e768a4e2f83b68224174e64abc5d", 16)
	assert.True(t, ok)
	s.FillBytes(S[:])
	spnChainId := new(big.Int).SetInt64(55244)
	originatingChainId := new(big.Int).SetInt64(55244)
	addr, err := EcrecoverPaymasterOperation(
		spnChainId,
		originatingChainId,
		ethCommon.HexToAddress("0x2e234DAe75C793f67A35089C9d99245E1C58470b"),
		PaymasterOperation{
			Owner:         ethCommon.HexToAddress("0x63177184B8b5e1229204067a76Ec4c635009CBD2"),
			Nonce:         new(big.Int).SetInt64(0),
			Deadline:      new(big.Int).SetInt64(1750418163),
			Typ: paymaster.PaymasterTypeMint,
			Market:        ethCommon.HexToAddress("0x2ef8fe80f525bfeca66cd16bd9e8af5556f40b11"),
			MaximumFee:    new(big.Int).SetInt64(0),
			AmountToSpend: new(big.Int).SetInt64(1000000),
			MinimumBack:   new(big.Int).SetInt64(0),
			Referrer:      ethCommon.HexToAddress("0x0000000000000000000000000000000000000000"),
			Outcome:       outcome,
			V:             27,
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
