package config

import (
	"strings"
	"os"

	"github.com/fluidity-money/9lives.so/lib/webhooks"
)

func parseWebhooks() (m webhooks.Webhooks) {
	m = make(map[string]string)
	strs := os.Getenv("SPN_WEBHOOKS_LIST")
	if len(strs) == 0 {
		return
	}
	for _, s := range strings.Split(strs, ",") {
		x := strings.Split(s, "@")
		if len(x) != 2 {
			panic("SPN_WEBHOOKS_LIST malformed")
		}
		m[x[0]] = x[1]
	}
	return
}
