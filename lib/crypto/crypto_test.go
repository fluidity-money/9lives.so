package crypto

import (
	"encoding/hex"
	"testing"

	ethCommon "github.com/ethereum/go-ethereum/common"
	ethCrypto "github.com/ethereum/go-ethereum/crypto"

	"github.com/stretchr/testify/assert"
)

var (
	// TestContractBytecode based on the Solidity tests.
	TestContractBytecode, _ = hex.DecodeString("602d5f8160095f39f35f5f365f5f37365f7300000000000000000000000000000000000000005af43d5f5f3e6029573d5ffd5b3d5ff3")

	// TestContractBytecodeRealWorld based on the real world deployment on testnet (maybe old).
	TestContractBytecodeRealWorld, _ = hex.DecodeString("602d5f8160095f39f35f5f365f5f37365f73c5f7a07a0fdfbe00f85dca1f088d8cdc9ef559b75af43d5f5f3e6029573d5ffd5b3d5ff3")
)

var (
	TestContractBytecodeHashed          = ethCrypto.Keccak256(TestContractBytecode)
	TestContractBytecodeRealWorldHashed = ethCrypto.Keccak256(TestContractBytecodeRealWorld)
)

var testGetTradingAddress = []struct {
	outcomes             []Outcome
	expectedIds          []string
	factoryAddress       string
	contractBytecodeHash []byte

	tradingAddr string
}{
	{
		[]Outcome{{"Koko", "Cat", 0}, {"Leo", "Dog", 123}},
		[]string{
			//bytes8(keccak256(abi.encodePacked("Leo", "Dog", uint8(123))))
			"3b79565a915eb950",
			//bytes8(keccak256(abi.encodePacked("Koko", "Cat", uint8(0))))
			"8f885992cafd4d5c",
		},
		"0x7FA9385bE102ac3EAc297483Dd6233D62b3e1496",
		TestContractBytecodeHashed,

		"0xDA7EaC0f112e8ED91c951972c60f8147FE51bbD4",
	},
	{
		[]Outcome{{"Koko", "Cat", 0}, {"Leo", "Dog", 123}},
		[]string{
			//bytes8(keccak256(abi.encodePacked("Leo", "Dog", uint8(123))))
			"3b79565a915eb950",
			//bytes8(keccak256(abi.encodePacked("Koko", "Cat", uint8(0))))
			"8f885992cafd4d5c",
		},
		"0xa088e2bc674e98ac3f2b251ca4fece66bdecb50b",
		TestContractBytecodeRealWorldHashed,

		"0x30882f33dde2d01c5483f1cdb2533ef019b71e27",
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
