package crypto

import (
	"encoding/hex"
	"testing"

	ethCommon "github.com/ethereum/go-ethereum/common"

	"github.com/stretchr/testify/assert"
)

var TestContractBytecodeRealWorldHashed, _ = hex.DecodeString("17ed8b2ca822b3813299535097b75b015e0de326f17e2b4a5eac9c629959756c")

var testGetTradingAddress = []struct {
	outcomes             []Outcome
	expectedIds          []string
	factoryAddress       string
	contractBytecodeHash []byte

	tradingAddr string
}{
	{
		[]Outcome{{"Trump", "Republican", 495}, {"Kamala", "Democrat", 592}},
		[]string{
			//bytes8(keccak256(abi.encodePacked("Kamala", "Democrat", uint8(592))))
			"11968c4bbb26f625",
			//bytes8(keccak256(abi.encodePacked("Trump", "Republican", uint8(495))))
			"1665bc497c0c2f5d",
		},
		"0x3A238B6b12F5da5ED7BAA7Fbb871fc5455AA2fc0",
		TestContractBytecodeRealWorldHashed,
		"0x3D9735deAd46d19f6BED4e47B3205647Ebd22Cb5",
	},
}

func TestGetTradingAddr(t *testing.T) {
	for i, test := range testGetTradingAddress {
		test := test
		t.Run("Check validity of the trading contract address", func(t *testing.T) {
			t.Parallel()
			ids, err := GetOutcomeIds(test.outcomes)
			assert.Nilf(t, err, "attempt %v get outcome ids", i)
			if len(test.expectedIds) > 0 {
				expectedIds := make([][]byte, len(test.expectedIds))
				for i, id := range test.expectedIds {
					if expectedIds[i], err = hex.DecodeString(id); err != nil {
						t.Fatalf("bad expected id: %v", err)
					}
				}
				assert.Equalf(t, expectedIds, ids, "attempt %v ids", i)
			}
			tradingAddr := GetTradingAddr(
				ids,
				ethCommon.HexToAddress(test.factoryAddress),
				test.contractBytecodeHash,
			)
			expectedAddr := ethCommon.HexToAddress(test.tradingAddr)
			assert.Equalf(t, expectedAddr, tradingAddr, "attempt %v not equal", i)
		})
	}
}
