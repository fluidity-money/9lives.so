package crypto

import (
	"encoding/hex"
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestGetMarketId(t *testing.T) {
	outcomes := []Outcome{
		{
			Name: "BTC will end up below $63091.5 before 1783932300",
			Seed: 1783931282,
		},
		{
			Name: "BTC will end up above $63091.5 before 1783932300",
			Seed: 1783931283,
		},
	}
	assert.Equal(t,
		"ecb973964cec52ad50f33bbc6c053b1c8aa9a6a6b6eaece48d6a7a3cbfcb36fe",
		hex.EncodeToString(GetMarketId(outcomes)),
	)
}
