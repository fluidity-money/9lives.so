package arb_wasm

import (
	"encoding/hex"
	"strings"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"

	ethCommon "github.com/ethereum/go-ethereum/common"
)

func TestUnpackProgramActivated(t *testing.T) {
	const dataHex = "2222222222222222222222222222222222222222222222222222222222222222" +
		"0000000000000000000000003333333333333333333333333333333333333333" +
		"00000000000000000000000000000000000000000000000000000000000004d2" +
		"0000000000000000000000000000000000000000000000000000000000000002"
	data, err := hex.DecodeString(dataHex)
	require.NoError(t, err)

	event, err := UnpackProgramActivated(
		ethCommon.HexToHash("0x"+strings.Repeat("11", 32)),
		data,
	)
	require.NoError(t, err)
	assert.Equal(t, strings.Repeat("11", 32), event.Codehash.String())
	assert.Equal(t, strings.Repeat("22", 32), event.ModuleHash.String())
	assert.Equal(t, "0x3333333333333333333333333333333333333333", event.Program.String())
	assert.Equal(t, "1234", event.DataFee.String())
	assert.Equal(t, uint16(2), event.Version)
}
