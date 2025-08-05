package webhooks

import (
	"testing"
	"encoding/hex"

	"github.com/stretchr/testify/assert"
)

func TestWebhooksTemplate(t *testing.T) {
	r, err := buildTwistJson("Hello world", F{
		"hello", hex.EncodeToString([]byte("Hello!")),
	})
	t.Logf("twist message: %v", r)
	assert.NoError(t, err)
}
