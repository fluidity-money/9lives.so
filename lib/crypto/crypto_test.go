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

	// TestContractBytecodeRealWorld1 based on the real world deployment on testnet (maybe old).
	TestContractBytecodeRealWorld1, _ = hex.DecodeString("602d5f8160095f39f35f5f365f5f37365f73934b4f2c3a08b864a174800d5349e676d2228fa45af43d5f5f3e6029573d5ffd5b3d5ff3")
)

var (
	TestContractBytecodeHashed              = ethCrypto.Keccak256(TestContractBytecode)
	TestContractBytecodeRealWorld1Hashed    = ethCrypto.Keccak256(TestContractBytecodeRealWorld1)
	TestContractBytecodeRealWorld2Hashed, _ = hex.DecodeString("4b5abc700e1e6538373db0decb478e837362d012d70e1a2c648d3e25f91d8e23")
	TestContractBytecodeRealWorld3Hashed, _ = hex.DecodeString("4a983a25ab349680c5a3936d92529f8a6a2b32a4a7bb97f8b0342f56bd4e1409")
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
		[]Outcome{{"Neela", "Cat", 88}, {"Russell", "Dog", 123}},
		[]string{
			//bytes8(keccak256(abi.encodePacked("Neela", "Cat", uint8(88))))
			"290ba3d293b129ab",
			//bytes8(keccak256(abi.encodePacked("Russell", "Dog", uint8(123))))
			"6f2af2188bfb19ca",
		},
		"0xa088e2bc674e98ac3f2b251ca4fece66bdecb50b",
		TestContractBytecodeRealWorld1Hashed,

		"0xB9D5CE9774cfC8811F097EDB81C6B8d627680b88",
	},
	{
		[]Outcome{{"Neela", "Cat", 88}, {"Russell", "Dog", 123}},
		[]string{
			//bytes8(keccak256(abi.encodePacked("Neela", "Cat", uint8(88))))
			"290ba3d293b129ab",
			//bytes8(keccak256(abi.encodePacked("Russell", "Dog", uint8(123))))
			"6f2af2188bfb19ca",
		},
		"0x14011904f399a7854FDf03329Bb4A897D336676f",
		TestContractBytecodeRealWorld2Hashed,

		"0xb382b6f3dd386f9fbfc0493ab8e2e6a6b57947aa",
	},
	{
		[]Outcome{{"Trump", "Republican", 495}, {"Kamala", "Democrat", 592}},
		[]string{
			//bytes8(keccak256(abi.encodePacked("Trump", "Republican", uint8(495))))
			"1665bc497c0c2f5d",
			//bytes8(keccak256(abi.encodePacked("Kamala", "Democrat", uint8(592))))
			"11968c4bbb26f625",
		},
		"0x3A238B6b12F5da5ED7BAA7Fbb871fc5455AA2fc0",
		TestContractBytecodeRealWorld3Hashed,
		"0x4344b2d160cc2beF8755E53234E42360fF07605c",
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
