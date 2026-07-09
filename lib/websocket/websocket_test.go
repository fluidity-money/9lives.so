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

// stalledClient performs a bare websocket upgrade over raw TCP and
// then never reads again, like a client whose network vanished with
// the TCP connection still open: the server's writes pile up until
// the socket buffer is full.
func stalledClient(t *testing.T, addr, path string) net.Conn {
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

// floodEndpoint registers a handler shaped like the production one:
// it pushes payloads at the client until the connection dies.
func floodEndpoint(path string) {
	payload := bytes.Repeat([]byte("x"), 32*1024)
	Endpoint(path, func(ctx context.Context, ip string, q url.Values, replies <-chan []byte, outgoing chan<- []byte, shutdown chan<- error, requestShutdown <-chan bool) {
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
}

// TestStalledClientWedgesWriterWithoutDeadline is the control: with
// the write deadline effectively disabled (the old behavior), a
// client that stops reading leaves the writer goroutine blocked in
// WriteMessage forever - the messages channel stops draining and the
// connection never tears down.
func TestStalledClientWedgesWriterWithoutDeadline(t *testing.T) {
	old := WriteWait
	WriteWait = time.Hour
	defer func() { WriteWait = old }()

	floodEndpoint("/draintest-control")
	server := httptest.NewServer(http.DefaultServeMux)
	defer server.Close()
	addr := strings.TrimPrefix(server.URL, "http://")

	baseline := endpointGoroutines()
	conn := stalledClient(t, addr, "/draintest-control")
	defer conn.Close()

	time.Sleep(3 * time.Second)
	if got := endpointGoroutines(); got <= baseline {
		t.Fatalf("expected the stalled connection's goroutines to persist without a write deadline, baseline %d, got %d", baseline, got)
	}
}

// TestStalledClientIsReapedByWriteDeadline proves the fix: the write
// errors out within WriteWait, the writer exits, and the whole
// connection tears down, returning the goroutine count to baseline.
func TestStalledClientIsReapedByWriteDeadline(t *testing.T) {
	old := WriteWait
	WriteWait = 500 * time.Millisecond
	defer func() { WriteWait = old }()

	floodEndpoint("/draintest-fixed")
	server := httptest.NewServer(http.DefaultServeMux)
	defer server.Close()
	addr := strings.TrimPrefix(server.URL, "http://")

	baseline := endpointGoroutines()
	conn := stalledClient(t, addr, "/draintest-fixed")
	defer conn.Close()

	// The connection must be alive at first.
	deadline := time.Now().Add(2 * time.Second)
	for endpointGoroutines() <= baseline && time.Now().Before(deadline) {
		time.Sleep(20 * time.Millisecond)
	}
	if got := endpointGoroutines(); got <= baseline {
		t.Fatalf("expected the connection's goroutines to appear, baseline %d, got %d", baseline, got)
	}

	// Once the socket buffer fills, the next write must hit the
	// deadline and tear the connection down completely.
	deadline = time.Now().Add(30 * time.Second)
	for endpointGoroutines() > baseline && time.Now().Before(deadline) {
		time.Sleep(50 * time.Millisecond)
	}
	if got := endpointGoroutines(); got > baseline {
		t.Fatalf("stalled connection was not reaped by the write deadline: %d endpoint goroutines still running (baseline %d)", got, baseline)
	}
}
