package crypto

import (
	"encoding/hex"
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestGetMarketId(t *testing.T) {
	outcomes := []Outcome{
		{
			Name: "Yes",
			Desc: "",
			Seed: 671424635701772,
		},
		{
			Name: "No",
			Desc: "",
			Seed: 4374720138937106,
		},
	}
	outcomeIds, err := GetOutcomeIds(outcomes)
	assert.Nil(t, err)
	assert.Equalf(t, hex.EncodeToString(outcomeIds[0]), "72cfc911637aa0c4", "outcome 1 bad")
	assert.Equalf(t, hex.EncodeToString(outcomeIds[1]), "d2cd4a70ce6885d5", "outcome 2 bad")
	assert.Equal(t,
		"c27b300def7bb415cd56c150b2cb186e10a55980a39d974f8c6feb083f745514",
		hex.EncodeToString(GetMarketId(outcomes)),
	)
}
