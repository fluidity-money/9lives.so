package graph

import (
	"testing"

	ethCommon "github.com/ethereum/go-ethereum/common"

	"github.com/fluidity-money/9lives.so/cmd/graphql.ethereum/graph/model"
)

var testGetTradingAddress = []struct {
	outcomes         []model.OutcomeInput
	factoryAddress   ethCommon.Address
	contractBytecode []byte

	tradingAddr ethCommon.Address
}{}

func TestGetTradingAddress(t *testing.T) {
	for i, test := range testGetTradingAddress {
		test := test
		t.Run("Check validity of the trading contract address", func(t *testing.T) {
			t.Parallel()
			tradingAddr, err := getTradingAddress(test.outcomes, test.factoryAddress, test.contractBytecode)
			if *tradingAddr != test.tradingAddr {
				t.Errorf("Test %d: Expected %s, got %s", i, test.tradingAddr, tradingAddr)
			}
			if err != nil {
				t.Errorf("Test %d: Unexpected error: %s", i, err)
			}
		})
	}
}
