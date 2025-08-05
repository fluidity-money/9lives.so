package config

import "testing"

func TestParseWebhooks(t *testing.T) {
	t.Setenv("SPN_WEBHOOKS_LIST", `hello world@https://twist.com`)
	parseWebhooks()
}