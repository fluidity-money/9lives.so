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

const (
	// EnvHeartbeatUrl to optionally send a GET to on request.
	EnvHeartbeatUrl = "SPN_HEARTBEAT_URL"

	// EnvHeartbeatAlarmUrl to alarm an early death.
	EnvHeartbeatAlarmUrl = "SPN_HEARTBEAT_ALARM_URL"
)

var (
	urls      = make(chan string)
	urlAlarms = make(chan string)
)

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

func Alarm() {
	u := <-urlAlarms
	if u == "" {
		slog.Debug("skipping request to send message to heartbeat alarm url")
		return
	}
	slog.Debug("sending a heartbeat message")
	resp, err := client.Get(u)
	if err != nil {
		slog.Error("error reporting to heartbeat alarm", "err", err)
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
	sAlarm := os.Getenv(EnvHeartbeatAlarmUrl)
	go func() {
		for {
			urlAlarms <- sAlarm
		}
	}()
}
