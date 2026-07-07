package websocket

import (
	"context"
	"net/http"
	"net/http/httptest"
	"net/url"
	"strings"
	"testing"
	"time"
)

// Control run: with keepalives effectively disabled (the pre-fix
// behavior), silent zombies must persist, proving the reaping test
// detects the leak rather than passing vacuously.
func TestControlZombiesPersistWithoutKeepalive(t *testing.T) {
	oldWrite, oldPong, oldPing := WriteWait, PongWait, PingPeriod
	WriteWait, PongWait, PingPeriod = time.Hour, time.Hour, time.Hour
	defer func() { WriteWait, PongWait, PingPeriod = oldWrite, oldPong, oldPing }()

	Endpoint("/controltest", func(ctx context.Context, ip string, q url.Values, replies <-chan []byte, outgoing chan<- []byte, shutdown chan<- error, requestShutdown <-chan bool) {
		for {
			select {
			case <-ctx.Done():
				return
			case <-requestShutdown:
				return
			case <-replies:
			}
		}
	})
	server := httptest.NewServer(http.DefaultServeMux)
	defer server.Close()
	addr := strings.TrimPrefix(server.URL, "http://")

	baseline := endpointGoroutines()

	conn := zombieHandshake(t, addr, "/controltest")
	defer conn.Close()

	time.Sleep(3 * time.Second)
	if got := endpointGoroutines(); got <= baseline {
		t.Fatalf("expected zombie goroutines to persist without keepalive, baseline %d, got %d", baseline, got)
	}
}
