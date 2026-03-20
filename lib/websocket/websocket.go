package websocket

import (
	"context"
	"log/slog"
	"net/http"
	"net/url"
	"time"

	"github.com/gorilla/websocket"
)

const DeadlinePong = 3 * time.Minute

var websocketUpgrader = websocket.Upgrader{
	ReadBufferSize:  4096,
	WriteBufferSize: 4096,

	CheckOrigin: func(r *http.Request) bool { return true },
}

// Endpoint handles a HTTP request and upgrades it, giving the user a
// channel to receive messages down and a reply channel to send messages
// to the websocket. A context is also provided that is cancelled when
// the connection is torn down.
func Endpoint(endpoint string, handler func(ctx context.Context, ipAddr string, query url.Values, replies <-chan []byte, outgoing chan<- []byte, shutdown chan<- error, requestShutdown <-chan bool)) {
	http.HandleFunc(endpoint, func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Headers", "*")
		websocketConn, err := websocketUpgrader.Upgrade(w, r, nil)
		if err != nil {
			slog.Error("failed to handle a websocket upgrade",
				"err", err,
			)
			return
		}
		defer websocketConn.Close()

		ipAddress := r.RemoteAddr

		// connCtx is cancelled when any part of this connection tears down.
		// All spawned goroutines should select on connCtx.Done().
		connCtx, connCancel := context.WithCancel(r.Context())
		defer connCancel()

		var (
			messages                   = make(chan []byte, 1000)
			replies                    = make(chan []byte, 1000)
			chanHandlerRequestShutdown = make(chan error, 1)
			chanHandlerShutdown        = make(chan bool, 1)
			chanPongs                  = make(chan bool, 1)
		)

		// Reader goroutine
		go func() {
			defer connCancel() // ensure everything tears down when reader exits
			slog.Debug("beginning to read messages",
				"ip", ipAddress,
			)
			for {
				msgType, content, err := websocketConn.ReadMessage()
				if err != nil {
					slog.Error("failed to read websocket message",
						"ip", ipAddress,
						"err", err,
					)
					select {
					case chanHandlerShutdown <- true:
					default:
					}
					return
				}
				switch msgType {
				case websocket.PongMessage:
					continue
				case websocket.PingMessage:
					slog.Debug("incoming ping; scheduling pong",
						"ip", ipAddress,
					)
					select {
					case chanPongs <- true:
					default:
					}
					continue
				case websocket.TextMessage, websocket.BinaryMessage:
					slog.Debug("received websocket message",
						"ip", ipAddress,
						"len", len(content),
					)
				default:
					slog.Debug("received websocket message with unhandled type",
						"ip", ipAddress,
						"type", msgType,
					)
				}
				select {
				case replies <- content:
				case <-connCtx.Done():
					return
				default:
					slog.Debug("dropped inbound message (replies channel full)",
						"ip", ipAddress,
						"len", len(content),
					)
				}
			}
		}()

		// Writer goroutine
		go func() {
			defer connCancel() // ensure everything tears down when writer exits
			for {
				select {
				case <-connCtx.Done():
					slog.Debug("writer shutdown via context",
						"ip", ipAddress,
					)
					return
				case <-chanPongs:
					deadline := time.Now().Add(DeadlinePong)
					if err := websocketConn.WriteControl(websocket.PongMessage, nil, deadline); err != nil {
						slog.Error("failed to write pong control message",
							"ip", ipAddress,
							"err", err,
						)
						return
					}
				case message, ok := <-messages:
					if !ok {
						return
					}
					if err := websocketConn.WriteMessage(websocket.TextMessage, message); err != nil {
						slog.Error("failed to write websocket message",
							"ip", ipAddress,
							"err", err,
						)
						return
					}
				}
			}
		}()

		handler(
			connCtx,
			ipAddress,
			r.URL.Query(),
			replies,
			messages,
			chanHandlerRequestShutdown,
			chanHandlerShutdown,
		)
	})
}