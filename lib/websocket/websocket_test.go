package websocket

import (
	"bufio"
	"bytes"
	"context"
	"encoding/base64"
	"fmt"
	"net"
	"net/http"
	"net/http/httptest"
	"net/url"
	"runtime"
	"strings"
	"testing"
	"time"

	gws "github.com/gorilla/websocket"
)

// endpointGoroutines counts goroutines with a frame in this package's
// connection machinery (reader, writer, or the upgraded handler).
func endpointGoroutines() int {
	buf := make([]byte, 1<<22)
	n := runtime.Stack(buf, true)
	count := 0
	for _, block := range strings.Split(string(buf[:n]), "\n\n") {
		if strings.Contains(block, "lib/websocket/websocket.go") {
			count++
		}
	}
	return count
}

// zombieHandshake performs a bare websocket upgrade over raw TCP and
// then goes silent: it never reads, writes, or pongs again, exactly
// like a client whose network vanished without closing TCP.
func zombieHandshake(t *testing.T, addr, path string) net.Conn {
	t.Helper()
	conn, err := net.Dial("tcp", addr)
	if err != nil {
		t.Fatalf("dial: %v", err)
	}
	key := base64.StdEncoding.EncodeToString(bytes.Repeat([]byte{0x42}, 16))
	fmt.Fprintf(conn, "GET %s HTTP/1.1\r\nHost: %s\r\nUpgrade: websocket\r\nConnection: Upgrade\r\nSec-WebSocket-Key: %s\r\nSec-WebSocket-Version: 13\r\n\r\n", path, addr, key)
	resp, err := http.ReadResponse(bufio.NewReader(conn), nil)
	if err != nil {
		t.Fatalf("read upgrade response: %v", err)
	}
	if resp.StatusCode != http.StatusSwitchingProtocols {
		t.Fatalf("upgrade failed: %v", resp.Status)
	}
	return conn
}

// TestDeadConnectionsAreReaped proves that connections whose clients
// go silent are torn down: flooded connections via the write deadline
// (nobody draining the socket), quiet ones via the ping/pong read
// deadline. A client that answers pings survives. Without deadlines
// and pings the zombies' goroutines block forever and the goroutine
// count never returns to baseline.
func TestDeadConnectionsAreReaped(t *testing.T) {
	// Shrink keepalive windows so the test runs in seconds.
	oldWrite, oldPong, oldPing := WriteWait, PongWait, PingPeriod
	WriteWait, PongWait, PingPeriod = 500*time.Millisecond, 1500*time.Millisecond, 300*time.Millisecond
	defer func() { WriteWait, PongWait, PingPeriod = oldWrite, oldPong, oldPing }()

	// A handler shaped like the production one: pushes payloads at
	// the client and drains replies until the connection dies.
	payload := bytes.Repeat([]byte("x"), 32*1024)
	Endpoint("/reaptest-flood", func(ctx context.Context, ip string, q url.Values, replies <-chan []byte, outgoing chan<- []byte, shutdown chan<- error, requestShutdown <-chan bool) {
		ticker := time.NewTicker(10 * time.Millisecond)
		defer ticker.Stop()
		for {
			select {
			case <-ctx.Done():
				return
			case <-requestShutdown:
				return
			case <-replies:
			case <-ticker.C:
				select {
				case outgoing <- payload:
				default:
				}
			}
		}
	})
	// A quiet endpoint that never writes, so only the ping/pong
	// read deadline can detect a dead client.
	Endpoint("/reaptest-quiet", func(ctx context.Context, ip string, q url.Values, replies <-chan []byte, outgoing chan<- []byte, shutdown chan<- error, requestShutdown <-chan bool) {
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

	// A healthy client: reads continuously, so gorilla's default
	// ping handler answers the server's pings for it.
	healthy, _, err := gws.DefaultDialer.Dial("ws://"+addr+"/reaptest-flood", nil)
	if err != nil {
		t.Fatalf("healthy dial: %v", err)
	}
	defer healthy.Close()
	healthyDead := make(chan struct{})
	go func() {
		defer close(healthyDead)
		for {
			if _, _, err := healthy.ReadMessage(); err != nil {
				return
			}
		}
	}()

	// Zombies: upgraded, then silent forever.
	for i := 0; i < 2; i++ {
		conn := zombieHandshake(t, addr, "/reaptest-flood")
		defer conn.Close()
	}
	quietZombie := zombieHandshake(t, addr, "/reaptest-quiet")
	defer quietZombie.Close()

	// Shortly after connecting, the healthy client and at least the
	// quiet zombie (which cannot be reaped before PongWait) must be
	// holding endpoint goroutines.
	time.Sleep(300 * time.Millisecond)
	if got := endpointGoroutines(); got < baseline+6 {
		t.Fatalf("expected at least %d endpoint goroutines while connections are live, got %d", baseline+6, got)
	}

	// Within a few PongWaits every zombie must be gone, leaving only
	// the healthy connection's goroutines.
	target := baseline + 3 // healthy reader + writer + handler
	deadline := time.Now().Add(6 * PongWait)
	for endpointGoroutines() > target && time.Now().Before(deadline) {
		time.Sleep(50 * time.Millisecond)
	}
	if got := endpointGoroutines(); got > target {
		t.Fatalf("zombie connections were not reaped: %d endpoint goroutines still running (baseline %d, target %d)", got, baseline, target)
	}

	// The healthy client must have survived the reaping.
	select {
	case <-healthyDead:
		t.Fatal("healthy client was disconnected by the keepalive logic")
	default:
	}
}
