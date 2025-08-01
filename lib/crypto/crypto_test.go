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
			Typ:           paymaster.PaymasterTypeMint,
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

func TestEcrecoverPaymasterForBuyOperation(t *testing.T) {
	o, _ := hex.DecodeString("a1038983ec52d223")
	var outcome [8]byte
	copy(outcome[:], o)
	var R, S, PermitR, PermitS [32]byte
	r, ok := new(big.Int).SetString("beaa4ec2f5a51dfac297d41e1a330e63a50cd56bb5f2a1fcea2512be92298a2b", 16)
	assert.True(t, ok)
	r.FillBytes(R[:])
	s, ok := new(big.Int).SetString("0ce21376d02a647e0a6d0598dc50a9e41612ff5f4fa305ee9eb10ce09c07f0c7", 16)
	assert.True(t, ok)
	s.FillBytes(S[:])
	spnChainId := new(big.Int).SetInt64(55244)
	originatingChainId := new(big.Int).SetInt64(55244)
	permitAmount, ok := new(big.Int).SetString("115792089237316195423570985008687907853269984665640564039457584007913129639935", 16)
	assert.True(t, ok)
	addr, err := EcrecoverPaymasterOperation(
		spnChainId,
		originatingChainId,
		ethCommon.HexToAddress("0xE990f05e2264f56435Fd7589FA2F70A879B0cE9f"),
		PaymasterOperation{
			Owner:         ethCommon.HexToAddress("0xd31fE3b2c23bbf7301deB5888F0627482A7622B6"),
			Nonce:         new(big.Int).SetInt64(1),
			Deadline:      new(big.Int).SetInt64(1753980449),
			Typ:           paymaster.PaymasterTypeMint,
			Market:        ethCommon.HexToAddress("0x7ab5ec0c59332a5c993468357c70e96b348aeb62"),
			MaximumFee:    new(big.Int).SetInt64(0),
			AmountToSpend: new(big.Int).SetInt64(10000),
			MinimumBack:   new(big.Int).SetInt64(0),
			Referrer:      ethCommon.HexToAddress("0x0000000000000000000000000000000000000000"),
			Outcome:       outcome,
			V:             27,
			R:             R,
			S:             S,
			PermitR:       PermitR,
			PermitS:       PermitS,
			PermitV:       0,
			PermitAmount:  permitAmount,
		},
	)
	assert.NoError(t, err)
	assert.Equal(t,
		ethCommon.HexToAddress("0xd31fE3b2c23bbf7301deB5888F0627482A7622B6"),
		*addr,
	)
}

func TestEcrecoverPaymasterForSellOperation(t *testing.T) {
	o, _ := hex.DecodeString("a9fc8624b9a93049")
	var outcome [8]byte
	copy(outcome[:], o)
	var R, S, PermitR, PermitS [32]byte
	r, ok := new(big.Int).SetString("389babdc4639caa1ff4f4ed7cc2fa2073b315c61fac3542d83724701fc23b1f7", 16)
	assert.True(t, ok)
	r.FillBytes(R[:])
	s, ok := new(big.Int).SetString("22570d204cea2dda2e3d93e97f954f4757269b7dd18515577f74ada8e6c2ca3f", 16)
	assert.True(t, ok)
	s.FillBytes(S[:])
	spnChainId := new(big.Int).SetInt64(55244)
	originatingChainId := new(big.Int).SetInt64(55244)
	permitAmount, ok := new(big.Int).SetString("115792089237316195423570985008687907853269984665640564039457584007913129639935", 16)
	assert.True(t, ok)
	addr, err := EcrecoverPaymasterOperation(
		spnChainId,
		originatingChainId,
		ethCommon.HexToAddress("0xE990f05e2264f56435Fd7589FA2F70A879B0cE9f"),
		PaymasterOperation{
			Owner:         ethCommon.HexToAddress("0xd31fE3b2c23bbf7301deB5888F0627482A7622B6"),
			Nonce:         new(big.Int).SetInt64(1),
			Deadline:      new(big.Int).SetInt64(1753976310),
			Typ:           paymaster.PaymasterTypeBurn,
			Market:        ethCommon.HexToAddress("0x7ab5ec0c59332a5c993468357c70e96b348aeb62"),
			MaximumFee:    new(big.Int).SetInt64(0),
			AmountToSpend: new(big.Int).SetInt64(0),
			MinimumBack:   new(big.Int).SetInt64(1000000),
			Referrer:      ethCommon.HexToAddress("0x0000000000000000000000000000000000000000"),
			Outcome:       outcome,
			V:             27,
			R:             R,
			S:             S,
			PermitR:       PermitR,
			PermitS:       PermitS,
			PermitV:       0,
			PermitAmount:  permitAmount,
		},
	)
	assert.NoError(t, err)
	assert.Equal(t,
		ethCommon.HexToAddress("0xd31fE3b2c23bbf7301deB5888F0627482A7622B6"),
		*addr,
	)
}
