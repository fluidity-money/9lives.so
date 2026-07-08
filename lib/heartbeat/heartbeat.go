// heartbeat: notify a system upstream that we're alive by making a HTTP
// request. Optionally configured with environment variable
// SPN_HEARTBEAT_URL.

package heartbeat

import (
	"log/slog"
	"net/http"
	"os"
	"time"
)

// EnvHeartbeatUrl to optionally send a GET to on request.
const EnvHeartbeatUrl = "SPN_HEARTBEAT_URL"

var urls = make(chan string)

// client bounds the heartbeat request. The default client has no
// timeout, so a hung request wedges the caller's pulse loop forever:
// pulses stop even though the process is healthy, and anything
// watching the heartbeat kills it for no reason.
var client = &http.Client{Timeout: 10 * time.Second}

func Pulse() {
	u := <-urls
	if u == "" {
		slog.Debug("skipping request to send message to heartbeat url")
		return
	}
	slog.Debug("sending a heartbeat message")
	resp, err := client.Get(u)
	if err != nil {
		slog.Error("error reporting to heartbeat", "err", err)
		return
	}
	resp.Body.Close()
}

func init() {
	s := os.Getenv(EnvHeartbeatUrl)
	if s == "" {
		slog.Info("heartbeat imported, but empty env", "env", EnvHeartbeatUrl)
	}
	go func() {
		for {
			urls <- s
		}
	}()
}
