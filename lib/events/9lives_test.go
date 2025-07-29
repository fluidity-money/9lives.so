package events

import (
	"testing"
	"encoding/hex"
	"math/big"

	"github.com/fluidity-money/9lives.so/lib/types/events"

	ethCommon "github.com/ethereum/go-ethereum/common"

	"github.com/stretchr/testify/assert"
)

func TestUnpackAmmDetails(t *testing.T) {
	t1 := ethCommon.HexToHash("0x0000000000000000000000000000000000000000000000000000000002b87f56")
	d, _ := hex.DecodeString("00000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000006f7cec2d3b830b7d4308a000000000000000000000000000000000000000000000000")
	r, err := UnpackAmmDetails(t1, d)
	assert.NoError(t, err)
	assert.Equal(t,
		events.NumberFromBig(new(big.Int).SetInt64(456654)),
		r.Shares[0].Shares,
	)
}
